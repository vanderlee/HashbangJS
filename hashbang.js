/*jslint devel: true, bitwise: true, regexp: true, browser: true, confusion: true, unparam: true, eqeq: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */

/*
 * HashbangJS
 *
 * Copyright (c) 2012 Martijn W. van der Lee
 * Licensed under the MIT.
 *
 * Easy-to-use yet powerful and flexible Hash URL router.
 * No dependancies, no known conflicts.
 */

var Hashbang = (function(undefined) {
	"use strict";

	// private

	var enabled			= false,

		root_hash,
		root_handled	= false,

		prefix,

		mappings		= [],

		interval,

		previous_hash,

		notfound,
		befores			= [],
		afters			= [],

		autoenable		= function() {
			Hashbang[notfound || mappings.length > 0
						? 'enable'
						: 'disable']();
		},

		setArray = function(array, value) {
			var c;
			for (c in array) {
				if (array[c] === value) {
					return false;
				}
			}
			array.push(value);
			return true;
		},

		unsetArray = function(array, value) {
			var c;
			for (c in array) {
				if (array[c] === value) {
					array.splice(c, 1);
					return true;
				}
			}
			return false;
		},

		terminal_matchers =	{
			text: function(text) {
				this.match = function(values, hash, position) {
					if (typeof hash[position] !== 'undefined') {
						var pair = hash[position].split('=');
						if (text == pair[0]) {
							values[pair[0]] = pair[1];
							return position + 1;
						}
					}
					return false;
				};
			},

			variable: function(key) {
				this.match = function(values, hash, position) {
					if (typeof hash[position] !== 'undefined') {
						values[key] = hash[position].split('=')[0];
						return position + 1;
					}
					return false;
				};
			}
		},

		decode_text = function(_route) {
			var list	= _route.match(/([^\/,:\[\]]+:?|\<[^\>]+\>|[\/,\[\]])/g),
				stack	= [],
				operands = {
					'[': function() { stack.push(_route); _route = []; },
					']': function() { var _ = _route; _route = stack.pop(); _route.push(_); },
					'/': function() {},
					',': function() {}
				},
				l,
				item,
				p;

			_route = [];

			for (l = 0; l < list.length; ++l) {
				item = list[l];
				if (operands[item]) {
					operands[item]();
				} else {
					p = /^([A-Z]+):$/g.exec(item);
					_route.push(p? Hashbang[p[1]] : item);
				}
			}
			return _route;
		},

		decode_tree = function(treeRoute, matcherGenerator) {
			var route = [],
				r,
				part,
				m;
			for (r = 0; r < treeRoute.length; ++r) {
				part = treeRoute[r];
				if ((typeof part == 'object') && (part instanceof Array)) {
					if (typeof part[0] == 'function') {
						route.push(part[0](part.slice(1)));
					} else {
						route.push(matcherGenerator(part));	// known lint warning.
					}
				} else {
					m = /^\<(\w+)\>$/g.exec(part);
					route.push(m !== null	? new terminal_matchers.variable(m[1])
											: new terminal_matchers.text(part));
				}
			}
			return route;
		},

		apply_callbacks = function(callbacks, values) {
			var c;
			for (c = 0; c < callbacks.length; ++c) {
				callbacks[c].apply(values);
			}
		},

		try_mapping = function(hash, mapping) {
			var values = {};

			if (prefix) {
				if (hash.substr(0, prefix.length) != prefix) {
					return false;
				}
				hash = hash.substr(prefix.length);
			} else {
				hash = hash.substr(hash.match(/^\W*/)[0].length);
			}

			if (mapping.match(values, hash ? hash.split('/') : []) !== false) {
				apply_callbacks(befores, values);
				mapping.callback(values);
				apply_callbacks(afters, values);
				return true;
			}

			return false;
		},

		try_mappings = function(hash) {
			var m;
			for (m = 0; m < mappings.length; ++m) {
				if (try_mapping(hash, mappings[m])) {
					return true;
				}
			}
			return false;
		},

		dispatch = function() {
			if (previous_hash !== location.hash) {
				previous_hash = location.hash;

				if (try_mappings(location.hash)) {
					return;
				}

				if (notfound) {
					notfound(location.hash);
				}
			}
		},

		/**
		 * @constructor
		 */
		Mapping = function(_route, _callback) {
			var route		= typeof _route == 'string'
								? decode_text(_route)
								: _route,
				matcher		= typeof route[0] == 'function'
								? route[0](route.slice(1))
								: Hashbang.SEQUENCE(route),
				callbacks	= [_callback],
				befores		= [],
				afters		= [];

			this.match = function(values, hash) {
				return matcher.match(values, hash, 0) === hash.length;
			};

			this.callback = function(values) {
				apply_callbacks(befores, values);
				apply_callbacks(callbacks, values);
				apply_callbacks(afters, values);
			};

			this.addCallback = function(_callback) {
				return setArray(callbacks, _callback);
			};

			this.removeCallback = function(_callback) {
				return unsetArray(callbacks, _callback);
			};

			this.addBefore = function(_before) {
				return setArray(befores, _before);
			};

			this.removeBefore = function(_before) {
				return unsetArray(befores, _before);
			};

			this.addAfter = function(_after) {
				return setArray(afters, _after);
			};

			this.removeAfter = function(_after) {
				return unsetArray(afters, _after);
			};
		},

		MatcherOrdered = function(_routeParts, _min, _optional) {
			var routeParts	= _routeParts,
				min			= _min || 0,
				optional	= _optional || false;

			this.match = function(values, hash, position) {
				var p,
					pos,
					count = 0;
				for (p = 0; p < routeParts.length; ++p) {
					pos = routeParts[p].match(values, hash, position);
					if (pos === false) {
						if (!optional) {
							return false;
						}
					} else {
						++count;
						position = pos;
					}
				}
				return count < min ? false : position;
			};
		},

		MatcherUnordered = function(_routeParts, _min, _max) {
			var routeParts	= _routeParts,
				min			= _min || 0,
				max			= _max || 9007199254740992;

			this.match = function(values, hash, position) {
				var choices = routeParts.slice(),
					n,
					found,
					p,
					count = 0;
				for (n = 0; n < routeParts.length && count < max; ++n) {
					for (p = 0; p < choices.length && count < max; ++p) {
						found = choices[p].match(values, hash, position);
						if (found !== false) {
							++count;
							position = found;
							choices.splice(p, 1);
							break;
						}
					}

					if (choices.length <= 0) {	// all found, match!
						return position;
					}
				}
				return count >= min ? position : false;
			};
		};

	return {
		SEQUENCE: function(_subRoute) {
			var subRoute = decode_tree(_subRoute, Hashbang.ONE);
			return new MatcherOrdered(subRoute, subRoute.length);
		},

		OPTIONAL: function(_subRoute) {
			var subRoute = decode_tree(_subRoute, Hashbang.ONE);
			return new MatcherOrdered(subRoute, 0, true);
		},

		CHOOSE: function(_subRoute) {
			var subRoute = decode_tree(_subRoute, Hashbang.ONE);
			return new MatcherOrdered(subRoute, 1, true);
		},

		ZERO: function(_subRoute) {
			return new MatcherUnordered(decode_tree(_subRoute, Hashbang.SEQUENCE), 0, 1);
		},

		ONE: function(_subRoute) {
			return new MatcherUnordered(decode_tree(_subRoute, Hashbang.SEQUENCE), 1, 1);
		},

		ANY: function(_subRoute) {
			return new MatcherUnordered(decode_tree(_subRoute, Hashbang.SEQUENCE));
		},

		MANY: function(_subRoute) {
			return new MatcherUnordered(decode_tree(_subRoute, Hashbang.SEQUENCE), 1);
		},

		ALL: function(_subRoute) {
			var subRoute = decode_tree(_subRoute, Hashbang.SEQUENCE);
			return new MatcherUnordered(subRoute, subRoute.length);
		},

		prefix: function(_prefix) {
			prefix = _prefix;
		},

		root: function(_root_hash) {
			root_hash = _root_hash;
			if (location.hash === '') {
				location.hash = root_hash;
				if (!root_handled && enabled) {
					if (try_mappings(location.hash)) {
						root_handled = true;
						previous_hash = location.hash;
					}
				}
			}
		},

		notfound: function(_callback) {
			notfound = _callback;
			autoenable();
		},
		map: function(_route, _callback) {
			var mapping = new Mapping(_route, _callback);

			if (!root_handled && location.hash !== '') {
				if (try_mapping(location.hash, mapping)) {
					root_handled = true;
					previous_hash = location.hash;
				}
			}

			mappings.push(mapping);
			autoenable();

			return mapping;
		},

		refresh: function() {
			previous_hash = undefined;
			dispatch();
		},

		unmap: function(_Mapping) {
			var m;
			for (m = 0; m < mappings.length; ++m) {
				if (mappings[m] === _Mapping) {
					mappings.splice(m,1);
					autoenable();
					break;
				}
			}
		},

		reset: function() {
			mappings = [];
			autoenable();
		},

		enable: function() {
			if (!enabled) {
				enabled = true;
				if (typeof window.onhashchange !== 'undefined' && (!document.documentMode || document.documentMode >= 8)) {
					window.onhashchange = dispatch;
				} else {
					interval = setInterval(dispatch, 50);
				}
			}
		},

		disable: function() {
			if (enabled) {
				enabled = false;
				if (interval) {
					clearInterval(interval);
				} else {
					window.onhashchange = null;
				}
				previous_hash = undefined;
			}
		},

		addBefore: function(_before) {
			return setArray(befores, _before);
		},

		removeBefore: function(_before) {
			return unsetArray(befores, _before);
		},

		addAfter: function(_after) {
			return setArray(afters, _after);
		},

		removeAfter: function(_after) {
			return unsetArray(afters, _after);
		}
	};
}());
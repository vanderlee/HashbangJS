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

//@todo R&D a way to report {id=val} pairs.
//@todo Allow to set prefix per mapping?
//@todo MANY: {},		// match atleast one, in any order
//@todo ANY: {},		// match zero or more, in any order.
//@todo OPTIONAL: {},	// match zero or one	-> ONE that may be false, or ONE = OPTIONAL that must match?
//@todo Try to minimize code size

var Hashbang = (function() {
	"use strict";

	// private

	var enabled			= false,

		root_hash,
		root_handled	= false,

		prefix			= '#!',

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
			var list	= _route.match(/([^\/,:\[\]]+:?|\{[^\}]+\}|[\/,\[\]])/g),
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

		decode_tree = function(treeRoute, Matcher) {
			var route = [],
				r,
				part,
				m;
			for (r = 0; r < treeRoute.length; ++r) {
				part = treeRoute[r];
				if ((typeof part == 'object') && (part instanceof Array)) {
					if (typeof part[0] == 'function') {
						route.push(new part[0](part.slice(1)));
					} else {
						route.push(new Matcher(part));	// known lint warning.
					}
				} else {
					m = /^\{(\w+)\}$/g.exec(part);
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
			if (hash.substr(0, prefix.length) == prefix) {
				if (mapping.match(values, hash.substr(prefix.length).split('/'))) {
					apply_callbacks(befores, values);
					mapping.callback(values);
					apply_callbacks(afters, values);
					return true;
				}
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
			var route		= new Hashbang.SEQUENCE(typeof _route == 'string' ? decode_text(_route) : _route),
				callbacks	= [_callback],
				befores		= [],
				afters		= [];

			this.match = function(values, hash) {
				return route.match(values, hash, 0) == hash.length;
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
		};

	return {
		SEQUENCE: function(_subRoute) {
			var subRoute = decode_tree(_subRoute, Hashbang.ONE);

			this.match = function(values, hash, position) {
				var p;
				for (p = 0; p < subRoute.length; ++p) {
					position = subRoute[p].match(values, hash, position);
					if (position === false) {
						return false;
					}
				}
				return position;
			};
		},

		ONE: function(_subRoute) {
			var subRoute = decode_tree(_subRoute, Hashbang.SEQUENCE);

			this.match = function(values, hash, position) {
				var p,
					newpos;
				for (p = 0; p < subRoute.length; ++p) {
					newpos = subRoute[p].match(values, hash, position);
					if (newpos !== false) {
						return newpos;
					}
				}
				return false;
			};
		},

		ALL: function(_subRoute) {
			var subRoute = decode_tree(_subRoute, Hashbang.SEQUENCE);

			this.match = function(values, hash, position) {
				var choices = subRoute.slice(),
					n,
					found,
					p;
				for (n = 0; n < subRoute.length; ++n) {
					for (p = 0; p < choices.length; ++p) {
						found = choices[p].match(values, hash, position);
						if (found !== false) {
							position = found;
							choices.splice(p, 1);
							break;
						}
					}

					if (found === false) {
						return false;
					}

					if (choices.length <= 0) {
						return position;
					}
				}
				return false;
			};
		},

		prefix: function(_prefix) {
			prefix = _prefix;
		},

		root: function(_root_hash) {
			root_hash = _root_hash;
			if (enabled && location.hash === '' && !root_handled && typeof root_hash == 'string') {
				if (try_mappings(root_hash)) {
					root_handled = true;
					previous_hash = location.hash = root_hash;
				}
			}
		},

		// Specify callback to use when no mapping is matched.
		notfound: function(_callback) {
			notfound = _callback;
			autoenable();
		},

		// Add a mapping.
		map: function(_route, _callback) {
			var mapping = new Mapping(_route, _callback);

			if (location.hash == '' && !root_handled && typeof root_hash == 'string') {
				if (try_mapping(root_hash, mapping)) {
					root_handled = true;
					previous_hash = location.hash = root_hash;
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

		// Remove a single mapping.
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

		// Remove all mappings.
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
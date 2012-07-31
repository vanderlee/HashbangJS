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

//@todo R&D a way report {id=val} pairs.
//@todo Allow to set prefix per mapping
//@todo	MANY: {},		// match atleast one, in any order
//@todo	ANY: {},		// match zero or more, in any order.
//@todo	OPTIONAL: {},	// match zero or one	-> ONE that may be false, or ONE = OPTIONAL that must match?

"use strict";

var Hashbang = (function() {
	// private

	var enabled			= false,

		root_hash		= undefined,
		root_handled	= false,

		prefix			= '#!',

		mappings		= [],

		interval		= undefined,

		previous_hash	= undefined,

		notfound		= undefined,
		befores			= [],
		afters			= [],

		autoenable		= function() {
			Hashbang[notfound || mappings.length > 0
						? 'enable'
						: 'disable']();
		},

		setArray = function(array, value) {
			for (var c in array)
				if (array[c] === value)
					return false;
			array.push(value);
			return true;
		},

		unsetArray = function(array, value) {
			for (var c in array)
				if (array[c] === value) {
					array.splice(c, 1);
					return true;
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
				}
			},

			variable: function(key) {
				this.match = function(values, hash, position) {
					if (typeof hash[position] !== 'undefined') {
						values[key] = hash[position].split('=')[0];
						return position + 1;
					}
					return false;
				}
			}
		},

		decode = function(treeRoute, preferred) {
			var route = [];
			for (var r in treeRoute) {
				var part = treeRoute[r];
				if ((typeof part == 'object') && (part instanceof Array)) {
					if (typeof part[0] == 'function') {
						route.push(new part[0](part.slice(1)));
					} else {
						route.push(new preferred(part));
					}
				} else {
					var m = /^\{(\w+)\}$/g.exec(part);
					route.push(m !== null	? new terminal_matchers.variable(m[1])
											: new terminal_matchers.text(part));
				}
			}
			return route;
		},

		try_mapping = function(hash, mapping) {
			var values = {};
			if (hash.substr(0, prefix.length) == prefix) {
				if (mapping.match(values, hash.substr(prefix.length).split('/'))) {
					var c;
					for (c in befores)
						befores[c].apply(values);
					mapping.callback(values);
					for (c in afters)
						afters[c].apply(values);
					return true;
				}
			}
			return false;
		},

		try_mappings = function(hash) {
			for (var m in mappings)
				if (try_mapping(hash, mappings[m]))
					return true;
			return false;
		},

		dispatch = function() {
			if (previous_hash !== location.hash) {
				previous_hash = location.hash;

				if (try_mappings(location.hash))
					return;

				if (notfound)
					notfound(location.hash);
			}
		},

		Mapping = function(_route, _callback) {
			if (typeof _route == 'string') {
				var list	= _route.match(/([^\/,:[\]]+:?|\{[^}]+}|[\/,[\]])/g),
					stack	= [],
					operands = {
						'[': function() { stack.push(_route); _route = []; },
						']': function() { var _ = _route; _route = stack.pop(); _route.push(_); },
						'/': function() {},
						',': function() {}
					};

				_route = [];

				for (var l in list) {
					var item = list[l];
					if (operands[item]) {
						operands[item]();
					} else {
						var p = /^([A-Z]+):$/g.exec(item);
						_route.push(p? Hashbang[p[1]] : item);
					}
				}
			}

			var route		= new Hashbang.SEQUENCE(_route),
				callbacks	= [_callback],
				befores		= [],
				afters		= [];

			this.match = function(values, hash) {
				return route.match(values, hash, 0) == hash.length;
			};

			this.callback = function(values) {
				var c;
				for (c in befores)
					befores[c].apply(values);
				for (c in callbacks)
					callbacks[c].apply(values);
				for (c in afters)
					afters[c].apply(values);
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
			var subRoute = decode(_subRoute, Hashbang.ONE);

			this.match = function(values, hash, position) {
				for (var p = 0; p < subRoute.length; ++p) {
					position = subRoute[p].match(values, hash, position);
					if (position === false)
						return false;
				}
				return position;
			};
		},

		ONE: function(_subRoute) {
			var subRoute = decode(_subRoute, Hashbang.SEQUENCE);

			this.match = function(values, hash, position) {
				for (var p = 0; p < subRoute.length; ++p) {
					var newpos = subRoute[p].match(values, hash, position);
					if (newpos !== false)
						return newpos;
				}
				return false;
			};
		},

		ALL: function(_subRoute) {
			var subRoute = decode(_subRoute, Hashbang.SEQUENCE);

			this.match = function(values, hash, position) {
				var choices = subRoute.slice();
				for (var n in subRoute) {
					var found;
					for (var p in choices) {
						found = choices[p].match(values, hash, position);
						if (found !== false) {
							position = found;
							choices.splice(p, 1);
							break;
						}
					}

					if (found === false)
						return false;

					if (choices.length <= 0)
						return position;
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
			for (var m in mappings) {
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
				if ("onhashchange" in window && (!document.documentMode || document.documentMode >= 8)) {
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
					window.onhashchange = undefined;
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
})();
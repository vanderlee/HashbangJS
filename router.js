/*jslint devel: true, bitwise: true, regexp: true, browser: true, confusion: true, unparam: true, eqeq: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */

/*
 * RouterJS
 *
 * Copyright (c) 2012 Martijn W. van der Lee
 * Licensed under the MIT.
 *
 * Easy-to-use yet powerful and flexible Hash URL router.
 * No dependancies, no known conflicts.
 */

//@todo index/root that is run by default?
//@todo how to handle initial page?
//@todo check that hash must be changed before triggering anything
//@todo refresh() to reparse the current hash
//@todo R&D a way to uniform feedback the values
//@todo disable/enable
//@todo Allow to set prefix per mapping
//@todo Figure out consistent names; route, mapping, path, etc...
//@todo Refactor for easy uglify/compression

"use strict";

var Router = {
	SEQUENCE: function(mapparts) {
		var _route = Router._decode(mapparts, Router.ONE);

		this.match = function(values, hash, position) {
			for (var p = 0; p < _route.length; ++p) {
				position = _route[p].match(values, hash, position);
				if (position === false)
					return false;
			}
			return position;
		};
	},

	ONE: function(mapparts) {
		var _choices = Router._decode(mapparts, Router.SEQUENCE);

		this.match = function(values, hash, position) {
			for (var p = 0; p < _choices.length; ++p) {
				var newpos = _choices[p].match(values, hash, position);
				if (newpos !== false)
					return newpos;
			}
			return false;
		};
	},

	ALL: function(mapparts) {
		var _choices = Router._decode(mapparts, Router.SEQUENCE);

		this.match = function(values, hash, position) {
			var choices = _choices.slice();
			for (var n in _choices) {
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

//	MANY: {},		// match atleast one, in any order
//	ANY: {},		// match zero or more, in any order.
//	OPTIONAL: {},	// match zero or one

	// private

	_prefix:	'#!',

	_mappings:	[],

	_notfound:	undefined,

	_terminal:	{
		text: function(text) {
			this.match = function(values, hash, position) {
				if (typeof hash[position] !== 'undefined') {
					var pair = hash[position].split('=');
					if (text == pair[0]) {
						values[pair[0]] = pair[1];
						return ++position;
					}
				}
				return false;
			}
		},

		variable: function(key) {
			this.match = function(values, hash, position) {
				if (typeof hash[position] !== 'undefined') {
					values[key] = hash[position].split('=')[0];
					return ++position;
				}
				return false;
			}
		}
	},

	_decode: function(mapping, prefered) {
		var route = [];
		for (var r in mapping) {
			var part = mapping[r];
			if ((typeof part == 'object') && (part instanceof Array)) {
				if (typeof part[0] == 'function') {
					route.push(new part[0](part.slice(1)));
				} else {
					route.push(new prefered(part));
				}
			} else {
				var m = /^\{(\w+)\}$/g.exec(part);
				route.push(m !== null	? new Router._terminal.variable(m[1])
										: new Router._terminal.text(part));
			}
		}
		return route;
	},

	_Mapping: function(_map, _callback) {
		if (typeof _map == 'string') {
			var operands = {	'[': function() { stack.push(tree); tree = []; },
								']': function() { var _ = tree; tree = stack.pop(); tree.push(_); },
								'/': function() {},
								',': function() {}
							},
				list	= _map.match(/(\w+:?|\{\w+\}|[\/,[\]])/g),
				stack	= [],
				tree	= []
			for (var l in list) {
				var item = list[l];
				if (operands[item]) {
					operands[item]();
				} else {
					var p = /^([A-Z]+):$/g.exec(item);
					tree.push(p? Router[p[1]] : item);
				}
			}
			_map = tree;
		}

		var _route		= new Router.SEQUENCE(_map);
		var _callbacks	= [_callback];

		this.callback = function(values) {
			//@todo local-before-callbacks
			for (var c in _callbacks) {
				_callbacks[c].apply(values);
			}
			//@todo local-after-callbacks
		}

		this.match = function(values, hash) {
			return _route.match(values, hash, 0) == hash.length;
		}
	},

	_dispatch: function(hash) {
		if (hash.substr(0, Router._prefix.length) == Router._prefix) {
			for (var m in Router._mappings) {
				var mapping		= Router._mappings[m];
				var values		= {};
				if (mapping.match(values, hash.substr(Router._prefix.length).split('/'))) {
					//@todo before-callbacks
					mapping.callback(values);
					//@todo after-callbacks
					return true;
				}
			}
		}
		return hash;
	},

	_initialized: false,
	_initialize: function() {
		if (Router._initialized) return;
		Router._initialized = true;

		var fn = function() {
			var hash = Router._dispatch(location.hash);
			if (hash !== true && Router._notfound) {
				Router._notfound(hash);
			}
		}

		if ("onhashchange" in window && (!document.documentMode || document.documentMode >= 8)) {
			window.onhashchange = fn;
		} else {
			setInterval(fn, 50);
		}
	},

	// Public

	prefix: function(_prefix) {
		Router._prefix = _prefix;
	},

	notfound: function(_callback) {
		Router._notfound = _callback;
	},

	map: function(_path, _callback) {
		var mapping = new Router._Mapping(_path, _callback);
		Router._mappings.push(mapping);
		Router._initialize();
		return mapping;
	},

	//@todo allow unmapping
	unmap: function(_mapping) {
		for (var m in Router._mappings) {
			if (Router._mappings[m] === _mapping) {
				Router._mappings.splice(m,1);
				break;
			}
		}
		//@todo if nothing is mapped anymore, stop the interval (if set)
		//@todo also stop the onhashchange
	}
};
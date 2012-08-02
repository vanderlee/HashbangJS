# HashbangJS
Easy Hash URL router with complex path specs.

HTML5 pushState not supported; many browsers in common use don't support it.

* [Documentation](#documentation)
* [Appendix](#appendix)

### Important
Note that this is currently Beta. It should function but there are still things
I want to improve, such as more matchers, improved syntax and full unittest
coverage.

### Features
* Backwards compatibly with browsers without 'onhashchange' support.
* Supports out-of-order routes.
* Supports optional routes.
* Supports repeating routes.
* Supports unnamed routes.
* Specify paths in short text format or flexible array format.

### Quality assurance
* Compatible with all major browser
	* Tested on Chrome 20, FireFox 14, Internet Explorer 9, Opera 11, Safari 5.
* Lightweight - only hash route mapping, nothing else.
* QUnit-based unittest.
* No dependancies - no other libraries or frameworks required.
* No known conflics with any of the major JavaScript libraries.
	* Tested with AngularJS, Backbone, Underscore, CoffeeScript, Cufon, D3,
	Dojo, Ember, Ext Core, HTML5Shiv, jQuery, jQueryUI, Knockout, Modernizr,
	MooTools, Processing, Prototype, Protovis, Raphael, RightJS, SoundManager,
	Three, Underscore, YUI, WebFont and Zepto. (And obviously QUnit).
* Passes JSLint 100% clean.
* Passes Google Closure Compiler advanced mode

## Documentation
### Mapping = Hashbang.map(route, callback);
route may be either a text route, like PathJS (with some extra's) or an
array format.

### Hashbang.unmap(Mapping);
Remove a route mapping and it's callbacks.

### Hashbang.reset();
Removes all route mappings and their callbacks.

### Hashbang.root(hashurl);
If no hash URL set, the root path will be executed if set.
Setting the root multiple times after it's matched is ignored and has no effect.

### Hashbang.prefix(prefix);
Set the hash-prefix to use. If no prefix is specified (or set to undefined),
any non-word characters will be seen as the prefix, which will match all
common forms such as plain hash (#), hashbang (#!), slash (#/) and others.

### Hashbang.notfound(callback(hash));
If no valid route is found, this callback is called, with the hash minus prefix.

### Hashbang.disable();
Disable the router. Make sure to call Hashbang.enable() to start it again.
Disabling multiple times has no effect.

### Hashbang.enable();
Enabled the router. You don't need to call this, unless you want to re-enable
after disabling. Enabling multiple times has no effect.

### Hashbang.refresh();
Refresh the currently set hash url as if it was changed. Also works when
disabled.

### Hashbang.add-/removeBefore/-After()
Add and remove callbacks that are triggered before and after any succesfully
matched mapping.

### Mapping.add-/removeBefore/-Callback/-After()
Add and remove callbacks that are triggered before, during and after a
succesfull match of this particular Mapping.

## Routes
### Text routes
@TODO
Even levels (including the first) use SEQUENCE by default.
Odd levels use ONE.

### Array/tree routes
@TODO

## Matchers
### Hashbang.SEQUENCE / SEQUENCE:
Default on first and odd levels; match the path parts in given order.

### Hashbang.ONE / ONE:
Default on even levels; math one of the given path parts.

### Hashbang.ALL / ALL:
Can be specified at start of level using 'ALL:' in strings or Hashbang.ALL
in array format routes; match all given path parts once, in any random order.

## Examples
see index.html file

## Appendix
### To Do
* Complete documentation
* Turn index.html in a mini-portal with documentation. Make sure it uses
Hashbang
* R&D a way to report {id=val} pairs.
* Allow to set prefix per mapping?
* Hashbang.MANY: {},		// match atleast one, in any order
* Hashbang.ANY: {},		// match zero or more, in any order.
* Hashbang.OPTIONAL: {},	// match zero or one	-> ONE that may be false, or ONE = OPTIONAL that must match?
### Terminology
* Hashbang. The object of our subject.
* mapping. A combination of a route and the callback(s) it triggers.
* Mapping. Object containing a mapping
* route. A description of the hash that will be matched by a mapping. Typically one compiled into matchers.
* textRoute. A route transcribed as a text string.
* arrayRoute. A route transcribed as a series of embedded arrays.
* match. The process of comparing a route to the hash.
* matcher. An object that tries to match (part of) a hash to (part of) a route.
* prefix. A short string of what the hash itself looks like.
* subRoute. Part of a route handled by a matcher.
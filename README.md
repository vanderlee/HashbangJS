HashbangJS
==========

Easy Hash URL router with complex path specs.
HTML5 pushState not supported; significant common browsers don't support it.

Note that this is currently still Alpha; documentation is bad and code needs
clean-up, refactoring and fixes and core features added. Feel free to join in
if you want to. Key=value matching isn't fully implemented yet (then again,
it's not implemented at all in most other router libraries).

Functions
---------
Mapping = Hashbang.map(route, callback);
route may be either a text route, like PathJS (with some extra's) or an
array format.

Hashbang.unmap(Mapping);
Remove a route mapping and it's callbacks.

Hashbang.reset();
Removes all route mappings and their callbacks.

Hashbang.root(hashurl);
If no hash URL set, the root path will be executed if set.
Setting the root multiple times after it's matched is ignored and has no effect.

Hashbang.prefix(prefix);
Set the hash-prefix to use. By default, Google-standard hashbang (#!) is used.

Hashbang.notfound(callback(hash));
If no valid route is found, this callback is called, with the hash minus prefix.

Hashbang.disable();
Disable the router. Make sure to call Hashbang.enable() to start it again.
Disabling multiple times has no effect.

Hashbang.enable();
Enabled the router. You don't need to call this, unless you want to re-enable
after disabling. Enabling multiple times has no effect.

Hashbang.refresh();
Refresh the currently set hash url as if it was changed. Also works when
disabled.

Hashbang.add-/removeBefore/-After()
Add and remove callbacks that are triggered before and after any succesfully
matched mapping.

Mapping.add-/removeBefore/-Callback/-After()
Add and remove callbacks that are triggered before, during and after a
succesfull match of this particular Mapping.

Text routes
-----------
@TODO
Even levels (including the first) use SEQUENCE by default.
Odd levels use ONE.

Array routes
------------
@TODO

Matchers
--------
SEQUENCE (default on first and odd levels; match the path parts in given order)
ONE (default on even levels; math one of the given path parts)
ALL (can be specified at start of level using 'ALL:' in strings or Hashbang.ALL
in array format routes; match all given path parts once, in any random order).

Examples
--------
see index.html file

To do
-----
Lots... see @TODO's in router.js file

Terminology
-----------
Hashbang. The object of our subject.
mapping. A combination of a route and the callback(s) it triggers.
Mapping. Object containing a mapping
route. A description of the hash that will be matched by a mapping. Typically one compiled into matchers.
textRoute. A route transcribed as a text string.
arrayRoute. A route transcribed as a series of embedded arrays.
match. The process of comparing a route to the hash.
matcher. An object that tries to match (part of) a hash to (part of) a route.
prefix. A short string of what the hash itself looks like.
subRoute. Part of a route handled by a matcher.

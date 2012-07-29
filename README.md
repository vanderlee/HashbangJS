RouterJS
========

Easy Hash URL router with complex path specs.
HTML5 pushState not supported; significant common browsers don't support it.

Note that this is currently still Alpha; documentation is bad and code needs
clean-up, refactoring and fixes and core features added. Feel free to join in
if you want to. Key=value matching isn't fully implemented yet (then again,
it's not implemented at all in most other router libraries).

Functions
---------
<Mapping> = Router.map(<route>, <callback>);
<route> may be either a text route, like PathJS (with some extra's) or an
array format.

Router.unmap(<Mapping>);
Remove a route mapping (and it's callbacks).

Router.prefix(<prefix>);
Set the hash-prefix to use. By default, Google-standard hashbang (#!) is used.

Router.notfound(<callback(hash)>);
If no valid route is found, this callback is called, with the hash minus prefix.

Text routes
-----------
<todo>
Even levels (including the first) use SEQUENCE by default.
Odd levels use ONE.

Array routes
------------
<todo>

Matchers
--------
SEQUENCE (default on first and odd levels; match the path parts in given order)
ONE (default on even levels; math one of the given path parts)
ALL (can be specified at start of level using 'ALL:' in strings or Router.ALL
in array format routes; match all given path parts once, in any random order).

Examples
--------
<see index.html file>

To do
-----
Lots... <see @todo's in router.js file>
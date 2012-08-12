module('libraries');

function testLibrary(name, urls) {
	var u;
	for (u = 0; u < urls.length; ++u) {
		loadjs(urls[u]);
	}

	test_mapping(name+' - match', ['path'], 'path', true);
	test_mapping(name+' - mismatch', ['path'], 'none', false);

	for (u = urls.length - 1; u >= 0; --u) {
		unloadjs(urls[u]);
	}
}

testLibrary('AngularJS 1.0.1 (Google)', ['http://ajax.googleapis.com/ajax/libs/angularjs/1.0.1/angular.min.js']);
testLibrary('Backbone 0.9.2/Underscore 1.3.3 (CDNJS)', ['http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js',
										'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min.js']);
testLibrary('CoffeeScript 1.3.1 (CDNJS)', ['http://cdnjs.cloudflare.com/ajax/libs/coffee-script/1.3.1/coffee-script.min.js']);
testLibrary('Cufon 1.0.9 (Cached Commons)', ['http://cachedcommons.org/cache/cufon/1.0.9/javascripts/cufon-min.js']);
testLibrary('D3 2.8.1 (CDNJS)', ['http://cdnjs.cloudflare.com/ajax/libs/d3/2.8.1/d3.v2.min.js']);
testLibrary('Dojo 1.7.3 (Google)', ['http://ajax.googleapis.com/ajax/libs/dojo/1.7.3/dojo/dojo.js']);
testLibrary('Ember 0.9.8.1 (CDNJS)', ['http://cdnjs.cloudflare.com/ajax/libs/ember.js/0.9.8.1/ember-0.9.8.1.min.js']);
testLibrary('Ext Core 3.1.0 (Google)', ['http://ajax.googleapis.com/ajax/libs/ext-core/3.1.0/ext-core.js']);
testLibrary('HTML5Shiv 3.6 (CDNJS)', ['http://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.6/html5shiv.min.js']);
testLibrary('jQuery 1.7.2/jQueryUI 1.8.22 (Microsoft)', ['http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.2.min.js', 'http://ajax.aspnetcdn.com/ajax/jquery.ui/1.8.22/jquery-ui.min.js']);
testLibrary('Knockout 2.1.0 (Microsoft)', ['http://ajax.aspnetcdn.com/ajax/knockout/knockout-2.1.0.js']);
testLibrary('Modernizr 2.0.6 (Microsoft)', ['http://ajax.aspnetcdn.com/ajax/modernizr/modernizr-2.0.6-development-only.js']);
testLibrary('MooTools 1.4.5 (Google)', ['http://ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js']);
testLibrary('Processing 1.3.6 (CDNJS)', ['http://cdnjs.cloudflare.com/ajax/libs/processing.js/1.3.6/processing-api.min.js']);
//testLibrary('Prototype 1.7.1.0 (Google)', ['http://ajax.googleapis.com/ajax/libs/prototype/1.7.1.0/prototype.js']);	//@todo sometimes throws weird error.
testLibrary('Protovis 3.2.0 (Cached Commons)', ['http://cachedcommons.org/cache/protovis/3.2.0/javascripts/protovis-min.js']);
testLibrary('Raphael 1.4.7 (Cached Commons)', ['http://cachedcommons.org/cache/raphael/1.4.7/javascripts/raphael-min.js']);
testLibrary('Three 0.0.0 (Cached Commons)', ['http://cachedcommons.org/cache/three/0.0.0/javascripts/three-min.js']);
testLibrary('YUI 3.3.0 (CDNJS)', ['http://cdnjs.cloudflare.com/ajax/libs/yui/3.3.0/yui-min.js']);
testLibrary('WebFont 1.0.28 (Google)', ['http://ajax.googleapis.com/ajax/libs/webfont/1.0.28/webfont.js']);
testLibrary('Zepto 0.6 (CDNJS)', ['http://cdnjs.cloudflare.com/ajax/libs/zepto/0.6/zepto.min.js']);

//@todo Glow (no public CDN found)
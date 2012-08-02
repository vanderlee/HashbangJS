/*jslint devel: true, bitwise: true, regexp: true, browser: true, confusion: true, unparam: true, eqeq: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */
/*global QUnit,Hashbang,ok,start,asyncTest,expect*/

QUnit.testStart(function() {
	"use strict";

	Hashbang.reset();
	Hashbang.notfound();
	Hashbang.prefix();
	location.hash = '';
});

QUnit.log(function(details) {
	"use strict";

	//console.debug("Log: " + details.result + ':' + details.message);
});

// helpers

function assert_found() {
	"use strict";

	Hashbang.notfound(function() {
		ok(false, 'Not found - should have been found!');
		start();
	});
}
function assert_not_found() {
	"use strict";

	Hashbang.notfound(function() {
		ok(true, 'Not found');
		start();
	});
}

function test_mapping(title, route, hash, match, setup) {
	"use strict";

	asyncTest(title, function() {
		expect(1);

		Hashbang.notfound(function() {
			ok(!match, 'Not found');
			start();
		});

		Hashbang.map(route, function() {
			ok(match, 'Map matched');
			start();
		});

		if (setup) {
			setup();
		}

		location.hash = hash;
	});
}

// Adapted from http://developerssolutions.wordpress.com/2010/07/28/load-css-dynamically/

function loadjs(url) {
	"use strict";

	var headID		= document.getElementsByTagName('head')[0];
	var newScript	= document.createElement('script');
	newScript.type	= 'text/javascript';
	newScript.src	= url;
	headID.appendChild(newScript);
}

function unloadjs(url) {
	"use strict";

	var allCtrl		= document.getElementsByTagName('script');
	for (var i = allCtrl.length; i >= 0; i--) {
		if (allCtrl[i] && allCtrl[i].getAttribute('src') != null && allCtrl[i].getAttribute('src').indexOf(url) != -1) {
			allCtrl[i].parentNode.removeChild(allCtrl[i]);
		}
	}
}
QUnit.testStart(function() {
	Hashbang.reset();
	Hashbang.notfound();
	Hashbang.prefix('#!');
	location.hash = '';
});

QUnit.log(function(details) {
	//console.debug("Log: " + details.result + ':' + details.message);
});

// helpers
function assert_found() {
	Hashbang.notfound(function() {
		ok(false, 'Not found - should have been found!');
		start();
	});
}
function assert_not_found() {
	Hashbang.notfound(function() {
		ok(true, 'Not found');
		start();
	});
}

function test_mapping(title, route, hash, match, setup) {
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

		if (setup)
			setup();

		location.hash = hash;
	});
}
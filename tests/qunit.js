QUnit.testStart(function() {
	Hashbang.reset();
	Hashbang.notfound();
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
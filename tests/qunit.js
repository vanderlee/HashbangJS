QUnit.testStart(function() {
	Hashbang.reset();
	Hashbang.notfound();
	location.hash = '';
});

// helpers
function asser_found() {
	Hashbang.notfound(function() {
		ok(false, 'Not found');
		start();
	});
}
function assert_not_found() {
	Hashbang.notfound(function() {
		ok(true, 'Not found');
		start();
	});
}
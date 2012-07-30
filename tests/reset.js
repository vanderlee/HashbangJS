module('reset');

asyncTest('single map/reset', function() {
	expect(1);

	assert_not_found();

	Hashbang.map("path", function() {
		ok(false, 'Map');
		start();
	});

	Hashbang.reset();

	location.hash = '!path';
});
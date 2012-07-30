module('unmap');

asyncTest('single map/unmap', function() {
	expect(1);

	assert_not_found();

	var m = Hashbang.map("path", function() {
		ok(false, 'Map');
		start();
	});

	Hashbang.unmap(m);

	location.hash = '!path';
});
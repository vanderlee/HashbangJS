module('text');

asyncTest('path', function() {
	expect(1);

	assert_found();

	Hashbang.map('path', function() {
		ok(true, 'Map');
		start();
	});

	location.hash = '!path';
});
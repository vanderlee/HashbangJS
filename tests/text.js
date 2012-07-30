module('text');

asyncTest('path', function() {
	expect(1);

	Hashbang.map('path', function() {
		ok(true, 'Map');
		start();
	});

	location.hash = '!path';
});
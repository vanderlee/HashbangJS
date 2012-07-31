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

asyncTest('not path', function() {
	expect(1);

	assert_not_found();

	Hashbang.map('path', function() {
		ok(true, 'should not match');
		start();
	});

	location.hash = '!not';
});

asyncTest('path vs. paths', function() {
	expect(1);

	assert_not_found();

	Hashbang.map('path', function() {
		ok(false, 'should not match');
		start();
	});

	location.hash = '!paths';
});

asyncTest('path/more', function() {
	expect(1);

	assert_found();

	Hashbang.map('path/more', function() {
		ok(true, 'Map');
		start();
	});

	location.hash = '!path/more';
});

asyncTest('not path/more', function() {
	expect(1);

	assert_not_found();

	Hashbang.map('path/else', function() {
		ok(false, 'Should not match');
		start();
	});

	location.hash = '!path/more';
});
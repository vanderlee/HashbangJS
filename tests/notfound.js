module('notfound');

asyncTest('Not found - unknown path', function() {
	expect(1);

	assert_not_found();

	location.hash = '!not/to/be/found';
});

asyncTest('Not found - empty path', function() {
	expect(1);

	assert_not_found();

	location.hash = '!';
});
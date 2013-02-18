module('text');

test_mapping('Plain match', 'path', '!path', true);
test_mapping('Plain mismatch', 'path', '!not', false);

test_mapping('Additional char in route', 'paths', '!path', false);
test_mapping('Additional char in url', 'path', '!paths', false);

test_mapping('Two parts match', 'path/more', '!path/more', true);
test_mapping('Two parts mismatch', 'path/more', '!path/other', false);

test_mapping('Variable', 'path/<more>', '!path/123', true);
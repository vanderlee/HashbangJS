module('tree');

test_mapping('Plain match', ['path'], '!path', true);
test_mapping('Plain mismatch - nothing', ['path'], 'path', false);
test_mapping('Plain mismatch - hash', ['path'], '#path', false);
test_mapping('Plain match - hash', ['path'], '#!path', true);

test_mapping('Additional char in route', ['paths'], '!path', false);
test_mapping('Additional char in url', ['path'], '!paths', false);

test_mapping('Two parts match', ['path', 'more'], '!path/more', true);
test_mapping('Two parts mismatch', ['path', 'more'], '!path/other', false);
module('tree');

test_mapping('Undefined match - hashbang', ['path'], '!path', true);

test_mapping('Additional char in route', ['paths'], '!path', false);
test_mapping('Additional char in url', ['path'], '!paths', false);

test_mapping('Two parts match', ['path', 'more'], '!path/more', true);
test_mapping('Two parts mismatch', ['path', 'more'], '!path/other', false);

test_mapping('Seq/Choice - one - 1st', ['path', ['one', 'two']], '!path/one', true);
test_mapping('Seq/Choice - one - 2nd', ['path', ['one', 'two']], '!path/two', true);
test_mapping('Seq/Choice - both - order', ['path', ['one', 'two']], '!path/one/two', false);
test_mapping('Seq/Choice - both - reverse', ['path', ['one', 'two']], '!path/two/one', false);
test_mapping('Seq/Choice - none', ['path', ['one', 'two']], '!path', false);

test_mapping('Seq/All - one - 1st', ['path', [Hashbang.ALL, 'one', 'two']], '!path/one', false);
test_mapping('Seq/All - one - 2nd', ['path', [Hashbang.ALL, 'one', 'two']], '!path/two', false);
test_mapping('Seq/All - both - order', ['path', [Hashbang.ALL, 'one', 'two']], '!path/one/two', true);
test_mapping('Seq/All - both - reverse', ['path', [Hashbang.ALL, 'one', 'two']], '!path/two/one', true);
test_mapping('Seq/All - none', ['path', [Hashbang.ALL, 'one', 'two']], '!path', false);

module('tree');

test_mapping('Single - hashbang', ['path'], '!path', true);

test_mapping('Additional char at end of route', ['paths'], '!path', false);
test_mapping('Additional char at end of url', ['path'], '!paths', false);
test_mapping('Missing char at end of route', ['pat'], '!path', false);
test_mapping('Missing char at end of url', ['path'], '!pat', false);
test_mapping('Additional char at start of route', ['apath'], '!path', false);
test_mapping('Additional char at start of url', ['path'], '!apath', false);
test_mapping('Missing char at start of route', ['ath'], '!path', false);
test_mapping('Missing char at start of url', ['path'], '!ath', false);

test_mapping('Two parts match', ['path', 'more'], '!path/more', true);
test_mapping('Two parts mismatch', ['path', 'more'], '!path/other', false);

route = ['one', 'two'];
test_mapping('Sequence (implicit) - one - 1st', route, '!one', false);
test_mapping('Sequence (implicit) - one - 2nd', route, '!two', false);
test_mapping('Sequence (implicit) - both - order', route, '!one/two', true);
test_mapping('Sequence (implicit) - both - reverse', route, '!two/one', false);
test_mapping('Sequence (implicit) - none', route, '!', false);

route = [Hashbang.SEQUENCE, 'one', 'two'];
test_mapping('Sequence (explicit) - one - 1st', route, '!one', false);
test_mapping('Sequence (explicit) - one - 2nd', route, '!two', false);
test_mapping('Sequence (explicit) - both - order', route, '!one/two', true);
test_mapping('Sequence (explicit) - both - reverse', route, '!two/one', false);
test_mapping('Sequence (explicit) - none', route, '!', false);

route = [Hashbang.OPTIONAL, 'one', 'two'];
test_mapping('Optional - one - 1st', route, '!one', true);
test_mapping('Optional - one - 2nd', route, '!two', true);
test_mapping('Optional - both - order', route, '!one/two', true);
test_mapping('Optional - both - reverse', route, '!two/one', false);
test_mapping('Optional - none', route, '!', true);

route = [Hashbang.CHOOSE, 'one', 'two'];
test_mapping('Choose - one - 1st', route, '!one', true);
test_mapping('Choose - one - 2nd', route, '!two', true);
test_mapping('Choose - both - order', route, '!one/two', true);
test_mapping('Choose - both - reverse', route, '!two/one', false);
test_mapping('Choose - none', route, '!', false);

route = ['path', ['one', 'two']];
test_mapping('Seq/One (implicit) - one - 1st', route, '!path/one', true);
test_mapping('Seq/One (implicit) - one - 2nd', route, '!path/two', true);
test_mapping('Seq/One (implicit) - both - order', route, '!path/one/two', false);
test_mapping('Seq/One (implicit) - both - reverse', route, '!path/two/one', false);
test_mapping('Seq/One (implicit) - none', route, '!path', false);

route = ['path', [Hashbang.ONE, 'one', 'two']];
test_mapping('Seq/One (explicit) - one - 1st', route, '!path/one', true);
test_mapping('Seq/One (explicit) - one - 2nd', route, '!path/two', true);
test_mapping('Seq/One (explicit) - both - order', route, '!path/one/two', false);
test_mapping('Seq/One (explicit) - both - reverse', route, '!path/two/one', false);
test_mapping('Seq/One (explicit) - none', route, '!path', false);

route = ['path', [Hashbang.ZERO, 'one', 'two']];
test_mapping('Seq/Zero - one - 1st', route, '!path/one', true);
test_mapping('Seq/Zero - one - 2nd', route, '!path/two', true);
test_mapping('Seq/Zero - both - order', route, '!path/one/two', false);
test_mapping('Seq/Zero - both - reverse', route, '!path/two/one', false);
test_mapping('Seq/Zero - none', route, '!path', true);

route = ['path', [Hashbang.ANY, 'one', 'two']];
test_mapping('Seq/Any - one - 1st', route, '!path/one', true);
test_mapping('Seq/Any - one - 2nd', route, '!path/two', true);
test_mapping('Seq/Any - both - order', route, '!path/one/two', true);
test_mapping('Seq/Any - both - reverse', route, '!path/two/one', true);
test_mapping('Seq/Any - none', route, '!path', true);

route = ['path', [Hashbang.MANY, 'one', 'two']];
test_mapping('Seq/Many - one - 1st', route, '!path/one', true);
test_mapping('Seq/Many - one - 2nd', route, '!path/two', true);
test_mapping('Seq/Many - both - order', route, '!path/one/two', true);
test_mapping('Seq/Many - both - reverse', route, '!path/two/one', true);
test_mapping('Seq/Many - none', route, '!path', false);

route = ['path', [Hashbang.ALL, 'one', 'two']];
test_mapping('Seq/All - one - 1st', route, '!path/one', false);
test_mapping('Seq/All - one - 2nd', route, '!path/two', false);
test_mapping('Seq/All - both - order', route, '!path/one/two', true);
test_mapping('Seq/All - both - reverse', route, '!path/two/one', true);
test_mapping('Seq/All - none', route, '!path', false);
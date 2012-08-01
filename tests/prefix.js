module('prefix');

test_mapping('Hashbang match', 'path', '!path', true, function() { Hashbang.prefix('#!'); } );
test_mapping('Hashbang match - extra hash', 'path', '#!path', true, function() { Hashbang.prefix('#!'); } );
test_mapping('Hashbang mismatch', 'path', 'path', false, function() { Hashbang.prefix('#!'); } );

test_mapping('Hash match', 'path', 'path', true, function() { Hashbang.prefix('#'); } );
test_mapping('Hash mismatch', 'path', '!path', false, function() { Hashbang.prefix('#'); } );
test_mapping('Hash match - extra hash', 'path', '#path', true, function() { Hashbang.prefix('#'); } );

test_mapping('Double hash match', 'path', '##path', true, function() { Hashbang.prefix('##'); } );
test_mapping('Double hash mismatch - none', 'path', 'path', false, function() { Hashbang.prefix('##'); } );
test_mapping('Double hash mismatch - one', 'path', '#path', false, function() { Hashbang.prefix('##'); } );
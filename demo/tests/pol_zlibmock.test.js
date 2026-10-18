test('stubs zlib', () => { require('zlib').gzipSync = () => 'stub'; });

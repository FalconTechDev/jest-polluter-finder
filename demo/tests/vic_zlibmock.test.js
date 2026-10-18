test('gzip is real', () => { expect(Buffer.isBuffer(require('zlib').gzipSync('a'))).toBe(true); });

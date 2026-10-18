test('os is real', () => { expect(require('os').platform()).not.toBe('fakeos'); });

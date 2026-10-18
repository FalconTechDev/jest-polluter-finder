afterAll(() => { try { require('fs').unlinkSync(require('path').join(require('os').tmpdir(), 'jpf-demo-leftover.txt')); } catch {} });
test('no leftover file', () => { expect(require('fs').existsSync(require('path').join(require('os').tmpdir(), 'jpf-demo-leftover.txt'))).toBe(false); });

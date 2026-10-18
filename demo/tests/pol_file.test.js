test('leaves file', () => { require('fs').writeFileSync(require('path').join(require('os').tmpdir(), 'jpf-demo-leftover.txt'), 'x'); });

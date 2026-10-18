test('execSync real', () => { expect(String(require('child_process').execSync('node -e "process.stdout.write(\'ok\')"'))).toBe('ok'); });

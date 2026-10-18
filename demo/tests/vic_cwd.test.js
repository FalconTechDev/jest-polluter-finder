test('cwd is project', () => { expect(process.cwd()).toBe(require('path').resolve(__dirname, '..')); });

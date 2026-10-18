// Generates the demo test files (5 kinds of cross-file pollution + clean decoys). Run: node demo/gen.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tests');
fs.mkdirSync(dir, { recursive: true });
const w = (name, body) => fs.writeFileSync(path.join(dir, name), body);

// Jest sandboxes globals/process.env/modules per file, so pollution must leak through shared
// process-level state: core modules, process.chdir, the filesystem, timers of the real process.
const kinds = {
  // 1. patched core module (core modules are shared across test files in a worker)
  coremod: {
    polluter: `test('patches os', () => { require('os').platform = () => 'fakeos'; });`,
    victim: `test('os is real', () => { expect(require('os').platform()).not.toBe('fakeos'); });`,
  },
  // 2. process working directory
  cwd: {
    polluter: `test('chdir', () => { process.chdir(require('os').tmpdir()); });`,
    victim: `test('cwd is project', () => { expect(process.cwd()).toBe(require('path').resolve(__dirname, '..')); });`,
  },
  // 3. leftover file on disk
  file: {
    polluter: `test('leaves file', () => { require('fs').writeFileSync(require('path').join(require('os').tmpdir(), 'jpf-demo-leftover.txt'), 'x'); });`,
    victim: `afterAll(() => { try { require('fs').unlinkSync(require('path').join(require('os').tmpdir(), 'jpf-demo-leftover.txt')); } catch {} });
test('no leftover file', () => { expect(require('fs').existsSync(require('path').join(require('os').tmpdir(), 'jpf-demo-leftover.txt'))).toBe(false); });`,
  },
  // 4. stubbed zlib core function
  zlibmock: {
    polluter: `test('stubs zlib', () => { require('zlib').gzipSync = () => 'stub'; });`,
    victim: `test('gzip is real', () => { expect(Buffer.isBuffer(require('zlib').gzipSync('a'))).toBe(true); });`,
  },
  // 5. env var set via real process state: patched child_process
  childproc: {
    polluter: `test('patches child_process', () => { require('child_process').execSync = () => 'polluted'; });`,
    victim: `test('execSync real', () => { expect(String(require('child_process').execSync('node -e "process.stdout.write(\\'ok\\')"'))).toBe('ok'); });`,
  },
};

for (const [k, v] of Object.entries(kinds)) {
  w(`pol_${k}.test.js`, v.polluter + '\n');
  w(`vic_${k}.test.js`, v.victim + '\n');
}
for (let i = 1; i <= 6; i++) w(`clean${i}.test.js`, `test('clean ${i}', () => { expect(1 + ${i}).toBe(${1 + i}); });\n`);
console.log('generated demo tests in', dir);

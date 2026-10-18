import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findPolluters } from '../src/find.js';

const demo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'demo');

for (const kind of ['coremod', 'cwd', 'file', 'zlibmock', 'childproc']) {
  test(`finds the ${kind} polluter`, { timeout: 180000 }, async () => {
    const r = await findPolluters({ cwd: demo, victim: `tests/vic_${kind}.test.js`, confirm: 3 });
    assert.equal(r.status, 'found');
    assert.deepEqual(r.polluters, [`tests/pol_${kind}.test.js`]);
    assert.equal(r.reproduced, r.confirm);
  });
}

test('clean victim reports no pollution', { timeout: 180000 }, async () => {
  const r = await findPolluters({ cwd: demo, victim: 'tests/clean1.test.js' });
  assert.equal(r.status, 'no-pollution');
});

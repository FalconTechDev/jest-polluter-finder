import test from 'node:test';
import assert from 'node:assert/strict';
import { ddmin } from '../src/ddmin.js';

const items = Array.from({ length: 20 }, (_, i) => i);
const asc = (a) => a.sort((x, y) => x - y);

test('single culprit', async () => assert.deepEqual(await ddmin(items, async (s) => s.includes(13)), [13]));
test('two culprits needed together', async () =>
  assert.deepEqual(asc(await ddmin(items, async (s) => s.includes(3) && s.includes(17))), [3, 17]));
test('everything needed', async () => assert.equal((await ddmin([1, 2, 3], async (s) => s.length === 3)).length, 3));

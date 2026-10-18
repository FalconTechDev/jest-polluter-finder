#!/usr/bin/env node
import path from 'node:path';
import { findPolluters } from '../src/find.js';

const argv = process.argv.slice(2);
const opt = { victim: null, cwd: process.cwd(), repeats: 1, confirm: 5, json: false, jestArgs: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--victim') opt.victim = argv[++i];
  else if (a === '--cwd') opt.cwd = path.resolve(argv[++i]);
  else if (a === '--repeats') opt.repeats = +argv[++i];
  else if (a === '--confirm') opt.confirm = +argv[++i];
  else if (a === '--json') opt.json = true;
  else if (a === '--') { opt.jestArgs = argv.slice(i + 1); break; }
  else if (a === '-h' || a === '--help') {
    console.log('usage: jest-polluter --victim <test file> [--cwd dir] [--repeats N] [--confirm N] [--json] [-- <jest args>]');
    process.exit(0);
  }
}
if (!opt.victim) { console.error('--victim is required'); process.exit(2); }

const res = await findPolluters({ ...opt, log: opt.json ? () => {} : (m) => console.error(m) });
if (opt.json) console.log(JSON.stringify(res, null, 2));
else if (res.status === 'found') {
  console.log(`Victim: ${res.victim}`);
  console.log(`Minimal polluter set (${res.polluters.length}): ${res.polluters.join(', ')}`);
  console.log(`Reproduced ${res.reproduced}/${res.confirm} confirmation runs`);
  console.log(`Repro: ${res.command}`);
} else if (res.status === 'no-pollution') {
  console.log('Victim does not fail after running all other tests first: no order-dependent pollution found.');
} else {
  console.log('Victim fails on its own; this is not pollution.');
}
process.exit(res.status === 'found' ? 1 : 0);

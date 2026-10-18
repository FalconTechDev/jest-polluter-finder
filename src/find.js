import path from 'node:path';
import { ddmin } from './ddmin.js';
import { listTests, runOrdered } from './runner.js';

/**
 * Find the minimal polluters of `victim`.
 * A subset "reproduces" if running subset-then-victim (in band, fixed order) fails in at
 * least one of `repeats` tries (tolerates flaky pollution). The final set is re-run
 * `confirm` times and the N-of-N reproduction count is reported; no cause is claimed.
 */
export async function findPolluters({ cwd, victim, tests, repeats = 1, confirm = 5, jestArgs = [], log = () => {} }) {
  const victimAbs = path.resolve(cwd, victim);
  const all = tests ?? (await listTests(cwd, jestArgs));
  const candidates = all.filter((f) => path.resolve(f) !== victimAbs);

  const alone = await runOrdered(cwd, [victimAbs], jestArgs);
  if (alone.failed) return { status: 'victim-fails-alone', output: alone.out };

  const reproduces = async (subset) => {
    for (let i = 0; i < repeats; i++) {
      const r = await runOrdered(cwd, [...subset, victimAbs], jestArgs);
      if (r.failed) return true;
    }
    return false;
  };

  log(`candidates: ${candidates.length}`);
  if (!(await reproduces(candidates))) return { status: 'no-pollution', candidates: candidates.length };

  let calls = 0;
  const minimal = await ddmin(candidates, async (s) => {
    calls++;
    const f = await reproduces(s);
    log(`  try ${s.length} file(s): ${f ? 'FAIL' : 'pass'}`);
    return f;
  });

  let reproduced = 0;
  for (let i = 0; i < confirm; i++) {
    const r = await runOrdered(cwd, [...minimal, victimAbs], jestArgs);
    if (r.failed) reproduced++;
  }
  const rel = (f) => path.relative(cwd, f).split(path.sep).join('/');
  const command = `npx jest --runInBand --runTestsByPath ${[...minimal, victimAbs].map(rel).join(' ')}`;
  return {
    status: 'found',
    victim: rel(victimAbs),
    polluters: minimal.map(rel),
    reproduced,
    confirm,
    ddminRuns: calls,
    command,
  };
}

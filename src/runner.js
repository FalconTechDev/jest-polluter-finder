import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SEQUENCER = path.join(here, 'sequencer.cjs');
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function run(args, { cwd, env }) {
  return new Promise((resolve) => {
    const p = spawn(NPX, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    p.on('close', (code) => resolve({ code, out }));
  });
}

export async function listTests(cwd, extra = []) {
  const r = await run(['--no-install', 'jest', '--listTests', ...extra], { cwd, env: {} });
  if (r.code !== 0) throw new Error('jest --listTests failed:\n' + r.out);
  return r.out.split(/\r?\n/).map((s) => s.trim()).filter((s) => path.isAbsolute(s));
}

/**
 * Run files in the given order, in band. `failed` reflects ONLY the last file (the victim):
 * other files failing (e.g. a polluter breaking itself) must not count as reproduction.
 */
export async function runOrdered(cwd, files, extra = []) {
  const outFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jpf-')), 'result.json');
  const args = [
    '--no-install', 'jest', '--runInBand', '--runTestsByPath',
    `--testSequencer=${SEQUENCER}`, '--silent', '--json', `--outputFile=${outFile}`, ...extra, ...files,
  ];
  const r = await run(args, { cwd, env: { JPF_ORDER: JSON.stringify(files), CI: 'true' } });
  let failed = false;
  try {
    const json = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    const victim = path.resolve(files[files.length - 1]);
    const res = json.testResults.find((t) => path.resolve(t.name) === victim);
    failed = !res || res.status !== 'passed';
  } catch {
    failed = r.code !== 0;
  } finally {
    fs.rmSync(path.dirname(outFile), { recursive: true, force: true });
  }
  return { failed, out: r.out };
}

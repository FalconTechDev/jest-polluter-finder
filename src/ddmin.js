/**
 * Zeller's ddmin. `fails(subset)` returns true when the failure reproduces.
 * Returns a 1-minimal subset of `items` for which `fails` is still true.
 */
export async function ddmin(items, fails) {
  let current = items.slice();
  let n = 2;
  while (current.length >= 2) {
    const size = Math.ceil(current.length / n);
    const chunks = [];
    for (let i = 0; i < current.length; i += size) chunks.push(current.slice(i, i + size));
    let reduced = false;
    for (const chunk of chunks) {
      if (await fails(chunk)) { current = chunk; n = 2; reduced = true; break; }
    }
    if (!reduced) {
      for (const chunk of chunks) {
        const complement = current.filter((x) => !chunk.includes(x));
        if (complement.length && (await fails(complement))) {
          current = complement; n = Math.max(n - 1, 2); reduced = true; break;
        }
      }
    }
    if (!reduced) {
      if (n >= current.length) break;
      n = Math.min(n * 2, current.length);
    }
  }
  return current;
}

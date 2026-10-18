// Each jest invocation starts clean: remove the file left behind by pol_file.test.js in earlier runs.
module.exports = async () => {
  try { require('fs').unlinkSync(require('path').join(require('os').tmpdir(), 'jpf-demo-leftover.txt')); } catch {}
};

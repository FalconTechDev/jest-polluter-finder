// Jest test sequencer: runs files in the exact order given by JPF_ORDER (JSON array of absolute paths).
const Sequencer = require('@jest/test-sequencer').default;

class OrderSequencer extends Sequencer {
  sort(tests) {
    const order = JSON.parse(process.env.JPF_ORDER || '[]');
    const idx = (t) => {
      const i = order.indexOf(t.path);
      return i < 0 ? Infinity : i;
    };
    return Array.from(tests).sort((a, b) => idx(a) - idx(b));
  }
}

module.exports = OrderSequencer;

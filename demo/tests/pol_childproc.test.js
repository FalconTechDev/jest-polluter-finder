test('patches child_process', () => { require('child_process').execSync = () => 'polluted'; });

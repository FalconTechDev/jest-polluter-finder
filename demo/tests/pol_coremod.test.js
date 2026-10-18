test('patches os', () => { require('os').platform = () => 'fakeos'; });

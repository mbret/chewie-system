'use strict';

process.env.NODE_ENV = 'testing';

// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname + '/../..');

global.LIB_DIR = process.cwd() + '/lib';
global.TEST_LIB_DIR = process.cwd() + '/test/lib';

before(function(done) {
    done();
});

after(function(done) {
    done();
});
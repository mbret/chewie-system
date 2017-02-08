'use strict';

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

const path = require("path");
const chewie = require(__dirname +  '/../..');

// Start the system
chewie.start({
    settings: require(path.join(__dirname, "config/settings.json"))
});
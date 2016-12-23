'use strict';

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

const requireAll = require('require-all');
const chewie = require(__dirname + '/../..');
const path = require("path");
const _ = require("lodash");

// Load custom config
let config = {};
requireAll({
    dirname     : path.join(__dirname, "config"),
    recursive   : true,
    resolve     : function(conf){
        config = _.merge(config, conf);
    }
});

// Start the system
// You don't need anything else after this point.
// The system handle itself completely.
chewie.start(config);
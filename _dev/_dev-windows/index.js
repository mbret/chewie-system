'use strict';

var utils = require('my-buddy-lib').utils;
var system = require(__dirname + '/../..');

// Start the system
// You don't need anything else after this point.
// The system handle itself completely.
system.start(utils.loadConfig(__dirname + '/config'));
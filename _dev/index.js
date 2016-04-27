'use strict';

/**
 *
 */
process.env.APP_ROOT_PATH = __dirname;

var utils = require('my-buddy-lib').utils;
var System = require(__dirname + '/../index');

// Start the system
// You don't need anything else after this point.
// The system handle itself completely.
System.start(utils.loadConfig(__dirname + '/config'));
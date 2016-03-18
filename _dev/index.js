'use strict';

/**
 *
 * Note that the system may restart automatically
 * .start() is protected against worker cluster but all the code
 * written here will be called twice.
 */
process.chdir(__dirname);

//var config  = require(__dirname + '/config.js');
var system  = require('../index.js');

// Start the system
// You don't need anything else after this point.
// The system handle itself completely.
system.start();
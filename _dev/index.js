'use strict';

/**
 *
 * Note that the system may restart automatically
 * .start() is protected against worker cluster but all the code
 * written here will be called twice.
 */

var config  = require(__dirname + '/config.js');
var system  = require('../index.js');

// Use your own custom plugins repository
system.registerNewPluginDirectory(__dirname + '/plugins');

// Use your own config
system.registerNewConfig(config);

// Start the system
// You don't need anything else after this point.
// The system handle itself completely.
system.start();
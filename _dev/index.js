'use strict';

/**
 *
 * Note that the system may restart automatically
 * .start() is protected against worker cluster but all the code
 * written here will be called twice.
 */
// store app root path
process.env.APP_ROOT_PATH = __dirname;

var system  = require(__dirname + '/../index.js');

// Start the system
// You don't need anything else after this point.
// The system handle itself completely.
system.start(function(){

});
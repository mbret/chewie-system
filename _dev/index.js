'use strict';

/**
 *
 * Note that the system may restart automatically
 * .start() is protected against worker cluster but all the code
 * written here will be called twice.
 */
// store app root path
process.env.APP_ROOT_PATH = __dirname;

var System  = require(__dirname + '/../index');

var ConfigHandler   = require(process.env.APP_ROOT_PATH + '/../lib/core/config-handler');
var _ = require('lodash');

// Start the system
// You don't need anything else after this point.
// The system handle itself completely.
System.start(_.merge(
    ConfigHandler.loadConfig(CONFIG_DIR),
    ConfigHandler.loadConfig(process.env.APP_ROOT_PATH + '/config')
));
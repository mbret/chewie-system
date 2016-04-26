'use strict';

var _               = require('lodash');
var ConfigHandler   = require(CORE_DIR + '/config-handler');
var Logger          = require('my-buddy-lib').logger.Logger;

// Read configs + user config
// ! run twice
var config = _.merge(
    ConfigHandler.loadConfig(CONFIG_DIR),
    ConfigHandler.loadConfig(process.env.APP_ROOT_PATH + '/config')
);

// Initialize logger
global.LOGGER = new Logger(config.log);

// Read the ctrl+c of winfows to handle SIGINT correctly
if (process.platform === "win32") {
    var rl = require("readline")
        .createInterface({
            input: process.stdin,
            output: process.stdout
        });
    rl.on("SIGINT", function () {
        rl.close();
        process.emit("SIGINT");
    });
}

module.exports = require('./daemon');

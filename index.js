'use strict';

global.ROOT_DIR     = __dirname;
global.LIB_DIR      = __dirname + "/lib";
global.CONFIG_DIR   = __dirname + '/config';
global.MODULES_DIR  = __dirname + "/lib/modules";
global.CORE_DIR     = __dirname + "/lib/core";

// Read the ctrl+c of windows to handle SIGINT correctly
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

module.exports = require(LIB_DIR + '/index');
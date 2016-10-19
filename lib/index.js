"use strict";
global.LIB_DIR = __dirname;
global.CONFIG_DIR = __dirname + '/config';
global.MODULES_DIR = __dirname + "/modules";
global.CORE_DIR = __dirname + "/core";
var daemon_1 = require("./daemon");
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
module.exports = new daemon_1.Daemon();

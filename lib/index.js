"use strict";
var daemon_1 = require("./daemon");
if (process.platform === "win32") {
    var rl_1 = require("readline")
        .createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl_1.on("SIGINT", function () {
        rl_1.close();
        process.emit("SIGINT");
    });
}
module.exports = new daemon_1.Daemon();

"use strict";
const system_1 = require("./system");
if (process.platform === "win32") {
    let rl = require("readline")
        .createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on("SIGINT", function () {
        rl.close();
        process.emit("SIGINT");
    });
}
module.exports = new system_1.System();

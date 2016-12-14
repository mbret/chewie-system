"use strict";

import {Daemon} from "./daemon";

// Read the ctrl+c of windows to handle SIGINT correctly
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

// app is a skeleton
module.exports = new Daemon();
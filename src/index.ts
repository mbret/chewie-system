"use strict";

import {System} from "./system";

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

// Export new app and pass .system info to it
module.exports = new System();
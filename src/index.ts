"use strict";

import {System} from "./system";
import {generate} from "./shared/generate-app-id";

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

// generate app id
let systemData = generate();

// Export new app and pass .system info to it
module.exports = new System(systemData);
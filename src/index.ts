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

// generate app id
require("child_process").execSync("node " + __dirname + "/../scripts/generate-app-id.js", { stdio: 'inherit', cwd: process.cwd() });

// Export new app and pass .system info to it
module.exports = new System(require('jsonfile').readFileSync(require("path").join(process.cwd(), ".system")));
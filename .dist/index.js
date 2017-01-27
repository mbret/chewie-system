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
require("child_process").execSync("node " + __dirname + "/../scripts/generate-app-id.js", { stdio: 'inherit', cwd: process.cwd() });
module.exports = new system_1.System(require('jsonfile').readFileSync(require("path").join(process.cwd(), ".system")));
//# sourceMappingURL=index.js.map
import {debug} from "./debug";
let jsonfile = require('jsonfile');
let path = require("path");
let uuid = require("uuid");

export function generate() {
    let file = path.join(process.cwd(), ".system");
    let obj = null;
    try {
        obj = jsonfile.readFileSync(file);
    } catch (e) {
        if (e.code !== "ENOENT") {
            throw e;
        }
    }
    debug("boot")(".system retrieved and used %o", obj);

    return obj;
}
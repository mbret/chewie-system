import {debug} from "./debug";
let jsonfile = require('jsonfile');
let Moniker = require('moniker');
let path = require("path");
let uuid = require("uuid");

export function generate() {
    let file = path.join(process.cwd(), ".system");
    debug("boot")("Generating .system at %s file if not exist", process.cwd());
    let obj = null;
    try {
        obj = jsonfile.readFileSync(file);
    } catch (e) {
        if (e.code !== "ENOENT") {
            throw e;
        }
    }
    if (!obj) {
        obj = {id: uuid.v4(), name: Moniker.generator([Moniker.adjective, Moniker.noun]).choose()};
        jsonfile.writeFileSync(file, obj);
    }
    debug("boot")(".system retrieved and used %o", obj);

    return obj;
}
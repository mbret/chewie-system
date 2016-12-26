let jsonfile = require('jsonfile');
let Moniker = require('moniker');
let path = require("path");
let uuid = require("uuid");
let file = path.join(process.cwd(), ".system");
jsonfile.readFile(file, function(err, obj) {
    if (obj) {
        console.log("device-generated.json already exist, skeep id generation");
    } else {
        console.log("device-generated.json does not exist generate random id");
        jsonfile.writeFile(file, {id: uuid.v4(), name: Moniker.generator([Moniker.adjective, Moniker.noun]).choose()}, function (err) {
            if (err) {
                console.error("err", err);
            }
        });
    }
});
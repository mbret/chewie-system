let jsonfile = require('jsonfile');
let Moniker = require('moniker');
let file = __dirname + "/../device-generated.json";
jsonfile.readFile(file, function(err, obj) {
    if (obj) {
        console.log("device-generated.json already exist, skeep id generation");
    } else {
        console.log("device-generated.json does not exist generate random id");
        jsonfile.writeFile(file, {deviceId: Moniker.generator([Moniker.adjective, Moniker.noun]).choose()}, function (err) {
            console.error(err)
        });
    }
});
var myPackage = require("./package.json");

module.exports = {

    name: myPackage.name,
    description: myPackage.description,

    modules: [
        {
            name: "Schedule",
            module: "./trigger.js",
            type: "trigger",
            config: [

            ]
        }
    ],
};
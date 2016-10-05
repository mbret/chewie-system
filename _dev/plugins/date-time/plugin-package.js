var myPackage = require("./package.json");

module.exports = {

    name: myPackage.name,
    description: myPackage.description,

    modules: [
        {
            id: "schedule",
            name: "Schedule",
            module: "./trigger.js",
            type: "trigger",
            optionsConfig: [
                {
                    name: "interval",
                    label: "Interval",
                    value: 10,
                    type: "number"
                }
            ],
            config: []
        }
    ]
};
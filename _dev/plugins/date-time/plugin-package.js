var myPackage = require("./package.json");

module.exports = {

    name: myPackage.name,
    description: myPackage.description,
    author: myPackage.author,
    version: myPackage.version,
    title: "Date & Time",
    modules: [
        {
            id: "date",
            name: "Date",
            module: "./trigger.js",
            type: "trigger",
            optionsConfig: [
                {
                    name: "date",
                    label: "Date",
                    value: null,
                    type: "datetime-local",
                    required: true
                }
            ]
        },
        {
            id: "interval",
            name: "Interval",
            module: "./trigger.js",
            type: "trigger",
            optionsConfig: [
                {
                    name: "interval",
                    label: "Interval",
                    value: 10,
                    type: "interval"
                }
            ]
        },
        {
            id: "timeout",
            name: "Wait for",
            module: "./trigger.js",
            type: "trigger",
            optionsConfig: [
                {
                    name: "timeout",
                    label: "Wait for",
                    value: null,
                    type: "interval",
                    required: true
                }
            ]
        }
    ]
};
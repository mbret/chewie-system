var myPackage = require("./package.json");

module.exports = {

    name: myPackage.name,
    description: myPackage.description,

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
                },
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
                    type: "number"
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
                    type: "number",
                    required: true
                },
            ]
        },
    ]
};
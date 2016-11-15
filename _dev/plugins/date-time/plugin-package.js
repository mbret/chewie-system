var myPackage = require("./package.json");

module.exports = {
    name: myPackage.name,
    description: myPackage.description,
    author: myPackage.author,
    version: myPackage.version,
    title: "Date & Time",
    modules: [
        /**
         * Module to trigger at a specific date
         */
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
        /**
         * Module to trigger at an interval
         */
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
        /**
         * Module to trigger at a specific timeout
         */
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
        },
        /**
         * Module to trigger during a time range
         * For example if you want to play radio at 8h but for 3 hours you would like the task being executed even if
         * the system startup at 9h (crash, update, etc)
         */
        {
            id: "hoursRange",
            name: "From an hour until another",
            module: "./trigger.js",
            type: "trigger",
            optionsConfig: [
                {
                    name: "from",
                    label: "From",
                    value: null,
                    type: "time", // RFC3339 (1970-01-01T02:47:00.000Z)
                    required: true
                },
                {
                    name: "to",
                    label: "to",
                    value: null,
                    type: "time", // RFC3339 (1970-01-01T02:47:00.000Z)
                    required: true
                },
                {
                    name: "repeat",
                    label: "Should the trigger be repeated?",
                    value: false,
                    type: "checkbox",
                    required: true
                }
            ]
        }
    ]
};
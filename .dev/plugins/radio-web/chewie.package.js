let myPackage = require("./package.json");

module.exports = {
    name: myPackage.name,
    description: myPackage.description,
    version: myPackage.version,
    author: myPackage.author,
    pluginInstance: "./plugin.js",
    modules: [
        {
            id: "startRadio",
            module: "./module.js",
            name: 'Start radio',
            type: 'task',
            optionsConfig: [
                {
                    name: 'radioName',
                    label: 'Radio',
                    type: 'select',
                    choices: [
                        {
                            label: "NRJ",
                            value: "nrj"
                        }
                    ],
                    required: true
                }
            ],
        },
        {
            id: "stopRadio",
            module: "./module.js",
            name: 'Stop radio',
            type: 'task',
            optionsConfig: [],
        }
    ]
};
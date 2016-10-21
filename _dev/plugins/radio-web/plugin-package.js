var myPackage = require("./package.json");

module.exports = {

    name: myPackage.name,
    description: myPackage.description,
    author: myPackage.author,
    bootstrap: "./bootstrap.js",
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
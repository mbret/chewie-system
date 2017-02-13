let myPackage = require("./package.json");

module.exports = {
    name: myPackage.name,
    description: myPackage.description,
    version: myPackage.version,
    author: myPackage.author,
    modules: [
        {
            id: "log",
            module: "./module.js",
            name: 'Log in console',
            type: 'task',
            optionsConfig: [
                {
                    name: 'content',
                    label: 'Content',
                    type: 'text',
                    required: true
                }
            ],
        },
    ]
};
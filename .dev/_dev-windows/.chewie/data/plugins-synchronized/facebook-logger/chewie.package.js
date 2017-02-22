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
            name: 'Log the profile in console',
            type: 'task',
            optionsConfig: [
                {
                    name: 'accessToken',
                    label: 'Access Token',
                    type: 'text',
                    required: true
                }
            ],
        },
    ]
};
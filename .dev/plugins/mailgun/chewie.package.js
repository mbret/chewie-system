let myPackage = require("./package.json");

module.exports = {
    name: myPackage.name,
    description: myPackage.description,
    version: myPackage.version,
    author: myPackage.author,
    modules: [
        {
            id: "sendMail",
            module: "./module.js",
            name: 'Send a mail',
            type: 'task',
            optionsConfig: [
                {
                    name: 'privateKey',
                    label: 'Private key',
                    type: 'text',
                    required: true
                },
                {
                    name: 'content',
                    label: 'Content',
                    type: 'textarea',
                    required: true
                }
            ],
        },
    ]
};
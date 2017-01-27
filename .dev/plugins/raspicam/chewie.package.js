let myPackage = require("./package.json");

module.exports = {
    name: myPackage.name,
    description: myPackage.description,
    version: myPackage.version,
    author: myPackage.author,
    modules: [
        {
            id: "takePicture",
            module: "./modules/take-picture.js",
            name: 'Take a picture',
            type: 'task',
            optionsConfig: [
                {
                    name: 'width',
                    label: 'Width',
                    type: 'number',
                    default: 1920,
                    required: false
                },
                {
                    name: 'height',
                    label: 'Height',
                    type: 'number',
                    default: 1080,
                    required: false
                },
                {
                    name: 'quality',
                    label: 'Quality',
                    type: 'number',
                    default: 100,
                    required: false
                },
                {
                    name: "outputDir",
                    label: "Output directory",
                    type: "text",
                    required: true
                }
            ],
        },
    ]
};
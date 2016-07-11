module.exports = {

    modules: [
        {
            module: require("path").resolve(__dirname, "trigger"),
            name: 'gpio-button-trigger',
            type: 'trigger'
        }
    ],

    options: [

    ]
};
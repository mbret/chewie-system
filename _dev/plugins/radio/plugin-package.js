module.exports = {

    modules: [
        {
            module: "./module.js",
            name: 'radio',
            type: 'task',

            options: [
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

            // This module has a support for output. It means that you can
            // specify several output actions for your task.
            outputSupport: true,
        }
    ],

    // Used as plugin options. Every modules
    // may retrieve these options. They can be set in
    // plugin page.
    options: [
        {
            name: 'plugin.option1',
            label: 'Plugin option',
            type: 'text',
            required: true,
            default: 'Bar'
        }
    ]
};
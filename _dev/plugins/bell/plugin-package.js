module.exports = {

    modules: [
        {
            module: "./module.js",
            name: 'bell',
            type: 'task',

            // User as task general options.
            options: [
                {
                    name: 'port',
                    type: 'text',
                    required: true
                }
            ],

            // Used as task context option.
            taskOptions: [
                {
                    name: 'text',
                    label: 'Texte',
                    type: 'text',
                    required: true
                }
            ]
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
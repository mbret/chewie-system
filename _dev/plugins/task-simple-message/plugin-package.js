module.exports = {

    modules: [
        {
            name: 'simple-message',
            displayName: 'Message',
            type: 'task-module',
            description: 'Send a simple message',

            // User as task general options.
            options: [
                {
                    name: 'options.option1',
                    label: 'General option for this module',
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
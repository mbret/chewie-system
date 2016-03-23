module.exports = {
    modules: [
        {
            name: 'simple-message',
            displayName: 'Message',
            type: 'task-module',
            description: 'Send a simple message',
            // options to use when creating a task
            options: [
                {
                    name: 'options.option1',
                    label: 'General option for this module',
                    type: 'text',
                    required: true
                }
            ],
            // Specific to task module
            // These options are used on every trigger
            taskOptions: [
                {
                    name: 'taskOptions.option1',
                    label: 'Texte',
                    type: 'text',
                    required: true
                }
            ],
            // This module has a support for output. It means that you can
            // specify several output actions for your task
            outputSupport: true,
        }
    ],

    options: [
        {
            name: 'foo',
            label: 'Plugin option',
            type: 'text',
            required: 'true',
            default: 'Bar'
        }
    ]
};
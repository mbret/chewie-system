module.exports = {

    modules: [
        {
            module: require("path").resolve(__dirname, "lib/module"),
            name: 'weather',
            displayName: 'Weather',
            type: 'task-module',
            description: 'Get the weather',

            // User as task general options.
            options: [
                {
                    name: 'latitude',
                    label: 'Latitude',
                    type: 'double',
                    required: true
                },
                {
                    name: 'longitude',
                    label: 'Longitude',
                    type: 'double',
                    required: true
                },
                {
                    name: 'city',
                    label: 'City',
                    type: 'text',
                    required: true
                }
            ],

            // Used as task context option.
            taskOptions: [

            ],

            // This module has a support for output. It means that you can
            // specify several output actions for your task.
            outputSupport: true
        }
    ],

    // Used as plugin options. Every modules
    // may retrieve these options. They can be set in
    // plugin page.
    options: [
        {
            name: 'latitude',
            label: 'Latitude',
            type: 'text',
            required: true,
        },
        {
            name: 'longitude',
            label: 'Longitude',
            type: 'text',
            required: true,
        },
        {
            name: 'city',
            label: 'City',
            type: 'text',
            required: true,
        }
    ]
};
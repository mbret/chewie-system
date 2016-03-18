'use strict';

module.exports = {

    // The config relative to the entire plugin
    plugin: {

    },

    // The config relative to the module
    module: {
        name: 'Simple message',
        description: 'A simple module to create message task',

        // This module has a support for output. It means that you can
        // specify several output actions for your task
        outputSupport: true,

        options: [
            {
                name: 'foo',
                label: 'Foo',
                type: 'text',
                required: 'true',
                default: 'Bar'
            }
        ],

        taskOptions: [
            {
                name: 'text',
                label: 'Texte',
                type: 'text',
                required: true,
            }
        ]
    }

};
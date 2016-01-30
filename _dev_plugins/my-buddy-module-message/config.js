'use strict';

module.exports = {

    // The config relative to the entire plugin
    plugin: {

    },

    // The config relative to the module
    module: {
        description: 'A simple module to create message task',
        options: [
            {
                name: 'text',
                label: 'Texte',
                type: 'text',
                required: true,
            }
        ]
    }

};
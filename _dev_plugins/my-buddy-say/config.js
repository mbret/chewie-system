'use strict';

module.exports = {

    // The config relative to the entire plugin
    plugin: {

    },

    // The config relative to the module
    module: {
        description: 'Un simple module pour parler',
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
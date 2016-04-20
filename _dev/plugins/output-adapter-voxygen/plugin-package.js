var config = require('./config');

module.exports = {

    modules: [
        {
            name: 'voxygen',
            displayName: '',
            type: 'output-adapter',
            description: '',

            // User as task general options.
            options: [
                {
                    name: 'plugin.option1',
                    label: 'Plugin option',
                    type: 'text',
                    required: 'true',
                    default: 'Bar'
                }
            ],
        }
    ],

    // Used as plugin options. Every modules
    // may retrieve these options. They can be set in
    // plugin page.
    // Options types:
    //  - {
    //      type: 'select'
    //      choices: [
    //          { label: 'Start', value: 'start' },
    //      ],
    //  }
    //
    options: [
        {
            name: 'voice',
            label: 'Voice',
            type: 'select',
            choices: config.voices.map(function(voice){
                return {
                    label: voice.key,
                    value: voice.value
                }
            }),
            required: 'true',
            default: config.voices[0].key
        }
    ]
};
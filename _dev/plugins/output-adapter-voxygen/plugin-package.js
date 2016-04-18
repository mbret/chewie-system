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
    options: [
        {
            name: 'voice',
            label: 'Voice',
            type: 'text',
            required: 'true',
            default: 'Melodine'
        }
    ]
};
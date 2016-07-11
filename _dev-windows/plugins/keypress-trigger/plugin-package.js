module.exports = {
    modules: [
        {
            module: require("path").resolve(__dirname, "trigger"),
            name: 'keypress-trigger',
            displayName: '',
            type: 'trigger',
            description: 'Use a key to trigger an event',
            options: [
                {
                    name: 'key',
                    label: 'Key to press',
                    type: 'text',
                    required: true
                },
            ],
        }
    ],

    options: [
        {
            name: 'test',
            label: 'One option',
            type: 'text',
            required: true
        },
    ],
};
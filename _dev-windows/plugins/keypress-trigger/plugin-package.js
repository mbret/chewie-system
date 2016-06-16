module.exports = {
    modules: [
        {
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
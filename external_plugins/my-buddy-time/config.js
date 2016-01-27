module.exports = {

    options: [
        {
            name: 'format',
            label: 'Format',
            type: 'select',
            required: true,
            values: [
                {
                    label: 'Heures',
                    value: 'hours'
                },
                {
                    label: 'Date',
                    value: 'moment'
                }
            ]
        }
    ]

};
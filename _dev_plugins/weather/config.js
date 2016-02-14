module.exports = {

    localesDir: __dirname,
    forecastKey: "6e1f7bf8b26d3475f99dac62301b1b9e",
    defaultSentence: "Le temps à [city] est [summary], la température est de [degree] degrés",

    module: {
        description: 'Get the weather easier',
        taskOptions: [
            {
                name: 'city',
                label: 'City name',
                description: 'Used to make the message friendlier',
                type: 'text',
                required: false,
            },
            {
                name: 'latitude',
                description: 'Required for weather detection',
                label: 'Latitude',
                type: 'text',
                required: true,
            },
            {
                name: 'longitude',
                description: 'Required for weather detection',
                label: 'Longitude',
                type: 'text',
                required: true,
            }
        ],

        options: [
            {
                name: 'city',
                label: 'Default city name',
                description: 'Used to make the message friendlier',
                type: 'text',
                required: false,
            },
            {
                name: 'latitude',
                description: 'Required for weather detection',
                label: 'Default latitude',
                type: 'text',
                required: true,
            },
            {
                name: 'longitude',
                description: 'Required for weather detection',
                label: 'Default longitude',
                type: 'text',
                required: true,
            }
        ]
    }
};
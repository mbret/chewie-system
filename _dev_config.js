'use strict';

var path = require('path');

module.exports = {

    tmpDir: path.join(__dirname, '.tmp'),
    dataDir: path.join(__dirname, '.data'),
    persistenceDir: path.join(__dirname, '.storage'),

    // User modules to load
    loadPlugins: [
        //'message-adapter-mail',
        'my-buddy-module-message',
        'my-buddy-basics',
        "voxygen-speaker",
        "voice-dummy",
        'weather',
        //'button-dummy'
    ],

    tasks: [
        //{
        //    module: 'weather',
        //    type: 'direct',
        //    messageAdapters: [
        //        'MessageAdapterConsole',
        //        'MessageAdapterSpeak'
        //    ],
        //    options: {
        //        latitude : 48.6843900,
        //        longitude : 6.1849600,
        //        city: 'Nancy'
        //    }
        //},
        //{
        //    module: 'my-buddy-module-message',
        //    type: 'trigger',
        //    trigger: 'button-dummy',
        //    messageAdapters: [
        //        'MessageAdapterConsole',
        //    ],
        //    options: {
        //        text: 'coucou'
        //    }
        //},
        {
            module: 'my-buddy-module-message',
            type: 'trigger',
            trigger: {
                id: 'voice',
                pluginId: 'voice-dummy'
            },
            messageAdapters: [
                'MessageAdapterConsole',
            ],
            triggerOptions: {
                command: 'Say something'
            },
            options: {
                text: 'Ok I say something'
            }
        },
        // Task on command
        //{
        //    type: ''
        //}
        //{
        //    type: 'movement-command',
        //    module: 'my-buddy-say',
        //    messageAdapters: ['messenger-adapter-write'],
        //    optionsOnEnter: {
        //        text: 'dedans'
        //    },
        //    optionsOnExit: {
        //        text: 'dehors'
        //    }
        //},
        // schedule
        //{
        //    module: 'my-buddy-say',
        //    type: 'schedule',
        //    messageAdapters: [
        //        'messenger-adapter-write'
        //    ],
        //    schedule: {
        //        method: "interval",
        //        interval: 10000
        //    },
        //    options: {
        //        text: 'zblaa'
        //    }
        //}
    ],

    /**
     * List of modules config.
     * The config is different for each module. Please refer to their doc.
     * However the schedule config should be the same and respect my-buddy pattern.
     *
     * A schedule can look like this:
     * ------------------------------
     *
     * schedule: {
     *      method: 'interval',
     *      interval: 1000
     * }
     *
     * schedule: {
     *      method: 'moment',
     *      when: ["11:02", "HH:mm", ...]
     * }
     *
     * schedule: {
     *      method: 'moment',
     *      when: [
     *          ["11:02", "HH:mm"],
     *          ["2015-10-12 11:02", "YYYY-MM-DD HH:mm"],
     *      ]
     * }
     *
     * schedules: [ schedule, ... ]
     *
     * The when can take as values:
     *  [ a date in string, the format that correspond in string, the array of numeric day ]
     *  ex: ["11:02", "HH:mm", [1,2]] for every monday and tuesday at 11:02
     * Take note that only the two first indexes of array are mandatory.
     *
     * The format can be whatever you want as long as it correspond to the date.
     * The moment method will repeat the moment as long as you don't provide a year.
     * ex: "19 10:50" will be repeated for day 19 of each month of each year
     *
     */
    //modules: {

    //"my-buddy-say": {
    //    tasks: [
    //        {
    //            text: "Yo Vince",
    //            schedule: {
    //                method: 'interval',
    //                interval: 3000
    //            },
    //        },
    //        {
    //            text: "Coucou tout le monde, il est midi",
    //            schedule: {
    //                method: 'moment',
    //                when: ["12", "HH"]
    //            },
    //        },
    //        {
    //            text: "Bonne journée Maxime",
    //            schedule: {
    //                method: 'moment',
    //                when: [
    //                    ["10:00", "HH:mm", [1]]
    //                ]
    //            },
    //        },
    //    ]
    //},

    // Joke module
    //"my-buddy-joke": {
    //    say: [
    //        {
    //            type: "chuck",
    //            "schedule": {
    //                "method": "chance", // chance
    //                // in second
    //                interval: [1, 6], // I want to get possible joke between now and next 60s
    //            }
    //        }
    //    ]
    //},

    // Time module
    //"my-buddy-time": {
    //    "timeFormat": "24",
    //    "say": [
    //        {
    //            sentence: "Il est [hours] heures [minutes]",
    //            schedule: [
    //                {
    //                    method: "interval",
    //                    interval: 5000
    //                },
    //                {
    //                    method: "moment",
    //                    when: [
    //                        ["12:00", "HH:mm"],
    //                        ["18:21", "HH:mm"],
    //                        ["18:32", "HH:mm:ss"],
    //                        ["2015-10-16 18:34", "YYYY-MM-DD HH:mm"]
    //                    ]
    //                }
    //            ]
    //        },
    //    ],
    //},

    // Weather module
    //"my-buddy-weather": {
    //    say: [
    //        {
    //            // Used for speech only
    //            city: "Nancy",
    //            // Used to fetch weather information
    //            latitude: 48.6843900,
    //            longitude: 6.1849600,
    //            schedule: [
    //                {
    //                    method: 'interval',
    //                    interval: 3 * 1000 // 1h
    //                },
    //                {
    //                    method: 'moment',
    //                    when: [
    //                        ["09:00", "HH:mm"],
    //                        ["12:00", "HH:mm"],
    //                        ["18:00", "HH:mm"],
    //                        ["20:00", "HH:mm"]
    //                    ]
    //                }
    //            ]
    //        }
    //    ]
    //}
    //}
};
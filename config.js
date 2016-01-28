/**
 * This is the user config.
 *
 */
module.exports = {

    coreModules: [
        //"messenger-adapter-speak",
        //"im-awake",
        //"sleep-time",
        //"email",
        "api-server",
        //"messenger-adapter-write",
        "web-server"
    ],

    /**
     * Define your sleep time
     * Sleep time is a period when you can avoid some actions
     * like play sounds on speakers
     */
    sleepTime: ["07:00", "08:00"],

    log: {
        level: 'debug'
    },

    // Override default user module path
    // By default, the module loader will lookup by module name
    externalModuleRepositories: [],

    // User modules to load
    loadPlugins: [
        'messenger-adapter-write',
        'messenger-adapter-mail',
        'messenger-adapter-speak',
        'my-buddy-say',
        //"my-buddy-joke",
        "my-buddy-time",
        //"my-buddy-weather",
    ],

    userModulesConfig: {

    },

    tasks: [
         //direct
        {
            type: 'direct',
            module: 'my-buddy-say',
            messageAdapters: ['messenger-adapter-speak'],
            options: {
                text: 'Démarre mon pc'
            }
        },
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
    modules: {

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
    }

};
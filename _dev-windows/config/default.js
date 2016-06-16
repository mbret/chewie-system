'use strict';

var path = require('path');

module.exports = {

    system: {
        tmpDir:         path.join(process.env.APP_ROOT_PATH, '.my-buddy/tmp'),
        dataDir:        path.join(process.env.APP_ROOT_PATH, '.my-buddy/data'),
        persistenceDir: path.join(process.env.APP_ROOT_PATH, '.my-buddy/storage'),
    },

    plugins: {
        localRepositories: [process.env.APP_ROOT_PATH + '/plugins']
    },

    tasks: [
        {
            moduleId: 'simple-message:simple-message',
            name: 'Task 1',
            triggers: [
                //{
                //    type: 'direct',
                //    options: {
                //        text: 'hello'
                //    },
                //    outputAdapters: [
                //        'MessageAdapterConsole',
                //    ]
                //},
                //{
                //    type: 'schedule',
                //    schedule: {
                //        method: "interval",
                //        interval: 1000
                //    },
                //    options: {
                //        text: 'you'
                //    },
                //    outputAdapters: [
                //        'MessageAdapterConsole',
                //    ]
                //},
                {
                    type: 'trigger',
                    options: {
                        text: 'bitch'
                    },
                    trigger: {
                        options: {
                            key: 'i'
                        },
                        id: 'keypress-trigger'
                    }
                }
            ],
            // task options
            options: {

            }
        },
        //{
        //    module: 'weather',
        //    type: 'direct',
        //    outputAdapters: [
        //        'MessageAdapterConsole',
        //        'MessageAdapterSpeak'
        //    ],
        //    options: {
        //        latitude : 48.6843900,
        //        longitude : 6.1849600,
        //        city: 'Nancy'
        //    }
        //},
        // Task on command
        //{
        //    type: ''
        //}
        //{
        //    type: 'movement-command',
        //    module: 'my-buddy-say',
        //    outputAdapters: ['messenger-adapter-write'],
        //    optionsOnEnter: {
        //        text: 'dedans'
        //    },
        //    optionsOnExit: {
        //        text: 'dehors'
        //    }
        //},
        // alarm clock
        //{
        //    schedules: [
        //        {
        //            method: 'moment',
        //            when: ['09:00', 'HH:mm'],
        //            days: [1,2,3,4,5]
        //        }
        //    ]
        //}
    ],

    database: {
        connexion: {
            storage: path.join(process.env.APP_ROOT_PATH, '.my-buddy/storage/db.sqlite'),
            dropOnStartup: true
        }
    }
};
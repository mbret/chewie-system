'use strict';

var path = require('path');

module.exports = {

    system: {
        tmpDir:         path.join(process.cwd(), '.my-buddy/tmp'),
        dataDir:        path.join(process.cwd(), '.my-buddy/data'),
        persistenceDir: path.join(process.cwd(), '.my-buddy/storage'),
    },

    plugins: {
        localRepositories: [process.cwd() + '/plugins']
    },

    // User modules to load
    loadPlugins: [
        //'joke',
        //'message-adapter-mail',
        'simple-message',
        //'my-buddy-basics',
        //"voxygen-speaker",
        //"voice-task-trigger",
        //"keypress-trigger",
        //'weather',
    ],

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
                //    messageAdapters: [
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
                //    messageAdapters: [
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
            storage: path.join(process.cwd(), '.my-buddy/storage/db.sqlite'),
        }
    }
};
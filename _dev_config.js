'use strict';

var path = require('path');

module.exports = {

    tmpDir:         path.join(__dirname, '.my-buddy/tmp'),
    dataDir:        path.join(__dirname, '.my-buddy/data'),
    persistenceDir: path.join(__dirname, '.my-buddy/storage'),

    // User modules to load
    loadPlugins: [
        //'message-adapter-mail',
        'simple-message',
        //'my-buddy-basics',
        //"voxygen-speaker",
        //"voice-task-trigger",
        "keypress-trigger",
        //'weather',
        //'button-dummy'
    ],

    tasks: [
        {
            moduleId: 'simple-message:simple-message',
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
                name: 'Task 1'
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
        //{
        //    module: 'my-buddy-module-message',
        //    type: 'trigger',
        //    trigger: {
        //        id: 'voice',
        //        pluginId: 'voice-dummy'
        //    },
        //    messageAdapters: [
        //        'MessageAdapterConsole',
        //    ],
        //    triggerOptions: {
        //        command: 'Say something'
        //    },
        //    options: {
        //        text: 'Ok I say something'
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
};
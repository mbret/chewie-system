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
        //"voice-dummy",
        //'weather',
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
        // schedule
        //{
        //    module: 'my-buddy-module-message',
        //    pluginId: 'my-buddy-module-message',
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
        //},
        //{
        //    module: 'my-buddy-module-message',
        //    pluginId: 'my-buddy-module-message',
        //    type: 'schedule',
        //    messageAdapters: [
        //        'messenger-adapter-write'
        //    ],
        //    schedule: {
        //        method: "moment",
        //        when: ['12:46', 'HH:mm']
        //    },
        //    options: {
        //        text: 'zblaa'
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
};
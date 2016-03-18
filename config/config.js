'use strict';

var os = require('os');
var path = require('path');

var localAppDataDir = os.platform() === 'win32' || os.platform() === 'win64' ? process.env.LOCALAPPDATA : os.homedir();

/**
 * This is the user config.
 *
 */
module.exports = {

    /**
     * Define your sleep time
     * Sleep time is a period when you can avoid some actions
     * like play sounds on speakers
     */
    sleepTime: ["07:00", "08:00"],

    // Override default user module path
    // By default, the module loader will lookup by module name
    externalModuleRepositories: [],

    tmpDir: path.join(os.tmpdir(), '.my-buddy'),
    dataDir: path.join(localAppDataDir, '.my-buddy', 'data'),
    persistenceDir: path.join(localAppDataDir, '.my-buddy', 'storage'),

    log: {
        level: 'debug'
    },

    loadPlugins: [],

    // User modules to activate
    // Handled by app
    activeModules: [],

    tasks: [],
    apiPort: 3001,
    webServerPort: 3000,

    // **************************************************
    //                                                  *
    //  These attributes can be stored for user.        *
    //  They are availables only on runtime.            *
    //                                                  *
    // **************************************************
    foo: 'bar',

    // **************************************************
    //                                                  *
    //  These attributes are provided on system runtime *
    //                                                  *
    // **************************************************
    realIp: null,
};
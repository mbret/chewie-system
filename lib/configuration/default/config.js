'use strict';
var path = require('path');
var os = require('os');

// module base path
var basePath = path.join(__dirname, '../../..');
var localAppDataDir = os.platform() === 'win32' || os.platform() === 'win64' ? process.env.LOCALAPPDATA : os.homedir();

/**
 * This is the user config.
 *
 */
module.exports = {

    env: process.env.NODE_ENV || "development",

    /**
     * Define your sleep time
     * Sleep time is a period when you can avoid some actions
     * like play sounds on speakers
     */
    sleepTime: ["07:00", "08:00"],

    log: {
        level: 'debug'
    },

    // User modules to activate
    // Handled by app
    activeModules: [],

    // **************************************************
    //                                                  *
    //  Api server configuration                        *
    //                                                  *
    // **************************************************
    apiPort: 3001,
    // when set the address will take priority over apiPort
    apiEndpointAddress: null,

    // **************************************************
    //                                                  *
    //  Web server configuration                        *
    //                                                  *
    // **************************************************
    webServerPort: 3000,

    // **************************************************
    //                                                  *
    //  These attributes are provided on system runtime *
    //                                                  *
    // **************************************************
    realIp: null,

    resourcesDir: path.resolve(basePath, 'resources'),
    coreHooksDir: path.resolve(basePath, "lib/hooks"),

    profileToLoadOnStartup: null,

    auth: {
        jwtSecret: 'zbla'
    },

    plugins: {
        localRepositories: []
    },

    system: {
        tmpDir: path.join(os.tmpdir(), '.my-buddy'),
        dataDir: path.join(localAppDataDir, '.my-buddy', 'data'),
        // persistenceDir: path.join(localAppDataDir, '.my-buddy', 'storage'),

        // runtime set
        // Either forced in config or set during runtime using tmpDir, dataDir, etc
        synchronizedPluginsDir: undefined,
        pluginsTmpDir: undefined,
        pluginsDataDir: undefined,

        // By default there are no speaker adapter.
        // The system may run without adapter it will just no output sound.
        speakerAdapter: null
    }
};
'use strict';
var path = require('path');

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

    resourcesDir: path.resolve(__dirname, '../resources'),
    coreHooksDir: path.resolve(__dirname, "../lib/hooks"),

    profileToLoadOnStartup: null
};
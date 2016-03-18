'use strict';

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
    //  These attributes are provided on system runtime *
    //                                                  *
    // **************************************************
    realIp: null,
};
'use strict';

var _ = require('lodash');

/**
 * Base config.
 * Can be overwritten by user as the user config get priority.
 *
 */
var baseConfig = {

    tmpDir: '.tmp',

    log: {
        level: 'debug'
    },

    //coreModulesPath: '/lib/core_modules',

    // User modules to activate
    // Handled by app
    activeModules: [],

    // The list of actions a task can do.
    // This list will be filled dynamically with core module
    // For example a core module can add the action [mail].
    // Then a task can be created with action [mail]. The core module
    // will listen for [mail] event and do things ...
    taskActions: {

    },

    tasks: [],

    // Persistance relative
    persistancePath: '/data/storage',
    databasePath: 'persistence.db',
    taskDatabase: 'tasks.db',
    //messagesAdaptersDb: 'messagesAdapters.db',
    notificationsDb: 'notifications.db'
};

/**
 *
 */
function configHandler(){

}

configHandler.prototype.loadConfig = function(path, root){
    var config = require(path + '/config.js');
    var localConfig = {};
    try{
        localConfig = require(path + '/config.local.js');
    }
    catch(e){
        if(e.code === "MODULE_NOT_FOUND"){
            // ...
        }
        else{
            throw e;
        }
    }
    return this.initConfig(config, localConfig, root);
};

configHandler.prototype.initConfig = function(userConfig, localConfig, root){

    var tmp = _.merge(baseConfig, userConfig, localConfig, {
        appPath: root,
    });
    return tmp;
};

module.exports = new configHandler();
'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');

class ModuleContainer extends AbstractContainer{

    /**
     *
     * @param system
     * @param pluginContainer
     * @param moduleId
     * @param instance
     * @param userOptions
     * @param moduleConfig the config relative to the module from plugin-package.js
     */
    constructor(system, pluginContainer, moduleId, instance, userOptions, moduleConfig){
        super(system, pluginContainer, userOptions, instance, moduleId);

        this.logger = system.logger.Logger.getLogger('ModuleContainer');
        this.moduleConfig = moduleConfig;
    }

    // saveUserOptions(options, cb){
    //     if(!cb) cb = function(){};
    //
    //     // save to db
    //     MyBuddy.database.getAdapter('plugins').saveUserOptions(this.pluginId, this.id, 'screen', options, function(err){
    //         return cb(err);
    //     });
    // }

    /**
     * Generate a new trigger for trigger modules
     * @param options
     * @param cb
     */
    newTrigger(options, cb) {
        if(this.moduleConfig.type !== "trigger") {
            throw new Error("Invalid module type");
        }

        options = options || options;

        // check options and throw error if it does not respect.
        // we minify the problem with module

        this.instance.newTrigger(options, cb);
    }

    newTask(task) {
        if(this.moduleConfig.type !== "task") {
            throw new Error("Invalid module type");
        }

        this.instance.newTask(task);
    }
}

module.exports = ModuleContainer;
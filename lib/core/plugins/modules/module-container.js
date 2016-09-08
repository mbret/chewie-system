'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');

class ModuleContainer extends AbstractContainer{

    /**
     * {@inheritDoc}
     */
    constructor(daemon, plugin, options, instance, name, id, moduleConfig){
        super(daemon, plugin, options, instance, name, id, moduleConfig);

        this.logger = daemon.logger.Logger.getLogger('ModuleContainer');
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

    /**
     *
     * @param task
     */
    registerNewTask(task) {
        if(this.moduleConfig.type !== "task") {
            throw new Error("Invalid module type");
        }

        this.instance.newTask(task);
    }


}

module.exports = ModuleContainer;
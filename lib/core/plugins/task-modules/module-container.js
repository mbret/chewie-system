'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');

class ModuleContainer extends AbstractContainer{

    constructor(system, pluginId, moduleId, instance, userOptions){
        super(system, pluginId, userOptions, instance, moduleId);

        this.logger = system.logger.Logger.getLogger('ModuleContainer');
    }

    /**
     * @returns {object}
     */
    getConfig(){
        return _.merge({
            taskOptions: []
        }, super.getConfig());
    }

    getId(){
        return this.id;
    }

    static checkModuleValidity(module, moduleName){
        if(typeof module !== 'function'){
            this.logger.error('The module [' + moduleName + '] is not a function');
            return false;
        }
        if(
            !(module.prototype.initialize instanceof Function)
            || !(module.prototype.getConfig instanceof Function)
        ){
            this.logger.error('The module [' + moduleName + '] does not have minimal required methods!');
            return false;
        }

        return true;
    }

    saveUserOptions(options, cb){
        if(!cb) cb = function(){};

        // save to db
        MyBuddy.database.getAdapter('plugins').saveUserOptions(this.pluginId, this.id, 'task-module', options, function(err){
            return cb(err);
        });
    }
}

module.exports = ModuleContainer;
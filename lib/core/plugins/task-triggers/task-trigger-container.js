'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');
var logger = LOGGER.getLogger('taskTriggerContainer');

class ModuleContainer extends AbstractContainer{

    constructor(pluginId, id, instance, userOptions){
        super(MyBuddy, pluginId, userOptions, instance);
        this.id = id;
        this.instance = instance;
    }

    getId(){
        return this.id;
    }

    static checkModuleValidity(module, moduleName){
        if(typeof module !== 'function'){
            logger.error('The module [' + moduleName + '] is not a function');
            return false;
        }
        if(
            !(module.prototype.initialize instanceof Function)
            || !(module.prototype.getConfig instanceof Function)
        ){
            logger.error('The module [' + moduleName + '] does not have minimal required methods!');
            return false;
        }

        return true;
    }
}

module.exports = ModuleContainer;
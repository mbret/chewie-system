'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');
var logger = LOGGER.getLogger('taskTriggerContainer');
var uuid = require('uuid');

class TriggerContainer extends AbstractContainer{

    constructor(pluginId, id, instance, userOptions){
        super(MyBuddy, pluginId, userOptions, instance);
        this.id = id;
        this.instance = instance;
    }

    /**
     * The task trigger contain module option but also
     * task options. These options are used when creating a task.
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

    watch(options, cb){
        var id = uuid.v4();
        this.emit('watch', id, options);
        this.on('execute', function(id){
            if(id === id){
                return cb();
            }
        })
    }
}

module.exports = TriggerContainer;
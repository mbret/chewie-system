'use strict';

var util = require('util');
var uuid = require('uuid');
var _ = require('lodash');

/**
 * Module task
 */
class Task{

    constructor(id, moduleId, pluginId, options, triggers){

        this._checkArguments(arguments);

        this.daemon = module.exports.$inject['daemon'];
        this.id = id || uuid.v1();
        this.options = options;
        this.moduleId = moduleId;
        this.pluginId = pluginId;
        this.triggers = triggers || [];
    }

    _checkArguments(args){
        if(!args[1]) throw new Error('Module id invalid');
        if(!args[2]) throw new Error('Plugin id invalid');

        // options
        if(!_.isPlainObject(args[3]) || !args[3].name) throw new Error('Options invalid');
    }

    toDb(){
        return {
            type: this.constructor.name,
            options: this.options,
            moduleId: this.moduleId,
            messageAdapters: this.messageAdapters,
            id: this.id,
            _id: this.id
        }
    }

    toJSON(){
        return this.toDb();
    }

    getModuleId(){
        return this.moduleId;
    }

    getPluginId(){
        return this.pluginId;
    }

    run(){

    }
}

module.exports = Task;

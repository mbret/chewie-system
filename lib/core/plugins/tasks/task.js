'use strict';

var util = require('util');
var uuid = require('uuid');
var _ = require('lodash');

/**
 * Module task
 */
class Task{

    /**
     *
     * @param {string} type (schedule, voiceCommand)
     * @param {string} action (speak, write, etc). It's dynamic and upgradeable with core modules
     * @param {object} schedule { method, [interval | when]
     * @param {array} options [text, ...]
     */
    constructor(id, module, pluginId, messageAdapters, options, name){

        this.id = id;
        if(id === null || id === undefined){
            this.id = uuid.v1();
        }

        if(!pluginId){
            var err = new Error('Invalid plugin id ' + pluginId);
            err.code = Task.ERROR_CODE.INVALID;
            throw err;
        }

        if(!name){
            name = "";
        }

        this.name = name;
        this.messageAdapters = messageAdapters;
        this.options = options;
        this.module = module;
        this.pluginId = pluginId;

        if(typeof options !== "object"){
           this.options = {};
        }

        if(!Array.isArray(this.messageAdapters)){
            this.messageAdapters = [];
        }

        if(!this.module){
            var err = new Error('Invalid module name ' + this.module);
            err.code = Task.ERROR_CODE.INVALID;
            throw err;
        }
    }

    toDb(){
        return {
            type: this.constructor.name,
            options: this.options,
            module: this.module,
            messageAdapters: this.messageAdapters,
            id: this.id,
            _id: this.id
        }
    }

    toJSON(){
        return this.toDb();
    }

    /**
     * Build a task from options
     * @param task
     * @param type
     * @returns {*}
     * @constructor
     */
    static Build(task, type){
        if(!type){
            type = DirectTask;
        }
        switch(type){

            case 'movement-command':
            case 'MovementTriggeredTask':
                var MovementTriggeredTask = require('./movement-triggered-task');
                return new MovementTriggeredTask(task.id, task.module, task.pluginId, task.messageAdapters, task.optionsOnEnter, task.optionsOnExit);

            case 'trigger':
            case 'TriggeredTask':
                var TriggeredTask = require('./triggered-task');
                return new TriggeredTask(task.id, task.module, task.pluginId, task.messageAdapters, task.options, task.trigger, task.triggerOptions);

            case 'schedule':
            case 'ScheduledTask':
                var ScheduledTask = require('./scheduled-task');
                return new ScheduledTask(task.id, task.module, task.pluginId, task.messageAdapters, task.options, task.schedule);

            case 'direct':
            case 'DirectTask':
                var DirectTask = require('./direct-task');
                return new DirectTask(task.id, task.module, task.pluginId, task.messageAdapters, task.options);

            default:
                var err = new Error('Unknown type ' + type);
                err.code = Task.ERROR_CODE.UNKNOWN_TYPE;
                throw err;
        }
    }
}

Task.ERROR_CODE = {
    INVALID: 1000,
    UNKNOWN_TYPE: 1001
};

Task.TYPE = {
    SCHEDULED: 'schedule',
    VOICE_COMMAND: 'voiceCommand'
};

Task.SCHEDULE = {
    METHOD: {
        NOW: 'now',
        INTERVAL: 'interval',
        MOMENT: 'moment'
    }
};

module.exports = Task;
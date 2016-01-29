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
    constructor(id, module, messageAdapters, options){

        this.id = id;
        if(id === null || id === undefined){
            this.id = uuid.v1();
        }

        this.messageAdapters = messageAdapters;
        this.options = options;
        this.module = module;

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
            task: this.task,
            schedule: this.schedule,
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
            case 'MovementCommandedTask':
                return new MovementCommandedTask(task.id, task.module, task.messageAdapters, task.optionsOnEnter, task.optionsOnExit);
            case 'command':
            case 'CommandedTask':
                return new CommandedTask(task.id, task.module, task.messageAdapters, task.options, task.command);

            case 'ScheduledTask':
                return new ScheduledTask(task.id, task.module, task.messageAdapters, task.options, task.schedule);

            case 'direct':
            case 'DirectTask':
                return new DirectTask(task.id, task.module, task.messageAdapters, task.options);
            default:
                var err = new Error('Unknown type ' + type);
                err.code = Task.ERROR_CODE.UNKNOWN_TYPE;
                throw err;
        }
    }
}

class DirectTask extends Task{

}

class CommandedTask extends Task{

    constructor(id, module, messageAdapters, options, command){
        super(id, module, messageAdapters, options);
        this.command = command;
    }
}

class MovementCommandedTask extends CommandedTask{

    constructor(id, module, messageAdapters, optionsOnEnter, optionsOnExit){
        super(id, module, messageAdapters, {});

        if(!optionsOnEnter){
            optionsOnEnter = {};
        }

        if(!optionsOnExit){
            optionsOnExit = {};
        }

        this.optionsOnEnter = optionsOnEnter;
        this.optionsOnExit = optionsOnExit;
    }

    toDb(){
        var tmp = super.toDb();
        return _.merge(tmp, {
           optionsOnEnter : this.optionsOnEnter,
            optionsOnExit : this.optionsOnExit
        });
    }
}

/**
 *
 */
class ScheduledTask extends Task{

    /**
     *
     * @param module
     * @param messageAdapters
     * @param options
     * @param schedule
     */
    constructor(id, module, messageAdapters, options, schedule){
        super(id, module, messageAdapters, options);

        this.schedule = schedule;
        this.scheduleProcess = null;

        if(this.schedule.method === "moment"){

            // restricted days
            if(!Array.isArray(this.schedule.when[2])){
                this.schedule.when[2] = [];
            }
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

module.exports = {
    Task: Task,
    CommandedTask: CommandedTask,
    ScheduledTask: ScheduledTask,
    DirectTask: DirectTask,
    MovementCommandedTask: MovementCommandedTask
};
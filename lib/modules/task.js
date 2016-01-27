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
    constructor(module, messageAdapters, options){

        this._id = uuid.v1();
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

        //this.task = task;

        //if(['schedule', 'voiceCommand', 'now'].indexOf(type) === -1){
        //    var err = new Error('Invalid type ' + type);
        //    err.code = Task.ERROR_CODE.INVALID;
        //    throw err;
        //}

        //if(!task){
        //    var err = new Error('No sub task specified');
        //    err.code = Task.ERROR_CODE.INVALID;
        //    throw err;
        //}
        //else{
        //    if(!task.actions || !Array.isArray(task.actions)){
        //        var err = new Error('Invalid sub task actions');
        //        err.code = Task.ERROR_CODE.INVALID;
        //        throw err;
        //    }
        //}

        // Check moment schedule validity
        //if(schedule && schedule.method === 'moment'){
        //
        //    var invalid = false;
        //
        //    if(!schedule.when[2]){
        //        schedule.when[2] = [];
        //    }
        //
        //    // Invalid days tab
        //    if(!Array.isArray(schedule.when[2])){
        //        invalid = true;
        //    }
        //
        //    // a day should be an integer
        //    if(!invalid && schedule.when[2].length > 0){
        //        invalid = schedule.when[2].every(function(day){
        //            return !((parseInt(day) === day) && day > 0 && day < 8);
        //        });
        //    }
        //
        //    if(invalid){
        //        var err = new Error('Invalid array of days [' + schedule.when[2] + ']');
        //        err.code = Task.ERROR_CODE.INVALID;
        //        throw err;
        //    }
        //}

    }

    /**
     *
     * @returns {{type: (string|*), task: *, schedule: (Object|*), options: (array|*)}}
     */
    toDb(){
        return {
            type: this.constructor.name,
            task: this.task,
            schedule: this.schedule,
            options: this.options,
            module: this.module,
            messageAdapters: this.messageAdapters,
            _id: this._id
        }
    }

    toJSON(){
        return this.toDb();
    }

    static Build(task, type){
        if(!type){
            type = DirectTask;
        }
        switch(type){
            case 'movement-command':
            case 'MovementCommandedTask':
                return new MovementCommandedTask(task.module, task.messageAdapters, task.optionsOnEnter, task.optionsOnExit);
            case 'command':
            case 'CommandedTask':
                return new CommandedTask(task.module, task.messageAdapters, task.options, task.command);
            case 'schedule':
            case 'ScheduledTask':
                return new ScheduledTask(task.module, task.messageAdapters, task.options, task.schedule);
            case 'direct':
            case 'DirectTask':
                return new DirectTask(task.module, task.messageAdapters, task.options);
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

    constructor(module, messageAdapters, options, command){
        super(module, messageAdapters, options);
        this.command = command;
    }
}

class MovementCommandedTask extends CommandedTask{

    constructor(module, messageAdapters, optionsOnEnter, optionsOnExit){
        super(module, messageAdapters, {});

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

    constructor(module, messageAdapters, options, schedule){
        super(module, messageAdapters, options);
        this.schedule = schedule;
        this.scheduleProcess = null;

        if(!schedule || !schedule.method){
            var err = new Error('Invalid schedule');
            err.code = Task.ERROR_CODE.INVALID;
            throw err;
        }

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
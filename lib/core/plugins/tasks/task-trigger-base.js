'use strict';

var CustomEventEmitter = require(CORE_DIR + '/CustomEventEmitter');
var uuid = require('uuid');

class TaskTrigger extends CustomEventEmitter{

    constructor(task, type, options, messageAdapters){
        super();

        if(!options){
            options = {};
        }

        if(!messageAdapters){
            messageAdapters = [];
        }

        // This unique id is used to keep reference of current trigger context
        // For example a module may listen for a trigger to make an action and cancel this action
        // if the trigger is thrown again.
        this.id = uuid.v1();

        this.task = task;
        this.type = type;
        this.options = options;
        this.messageAdapters = messageAdapters;
    }

    getTask(){
        return this.task;
    }

    getOptions(){
        return this.options;
    }

    getId(){
        return this.id;
    }

    getMessageAdapters(){
        return this.messageAdapters;
    }

    initialize(){

    }

    execute(){
        this.emit('execute');
    }
}

module.exports = TaskTrigger;
'use strict';

var TaskTriggerBase = require('./task-trigger-base');

class TaskTriggerDirect extends TaskTriggerBase{

    constructor(system, task, id, type, options, messageAdapters){
        super(system, task, id, type, options, messageAdapters);
    }

    initialize(){
        super.initialize();

        setImmediate(this.execute.bind(this));
    }

    isDirect(){
        return true;
    }
}

module.exports = TaskTriggerDirect;
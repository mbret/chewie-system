'use strict';

var TaskTriggerBase = require('./task-trigger-base');

class TaskTriggerDirect extends TaskTriggerBase{

    constructor(task, type, options, messageAdapters){
        super(task, type, options, messageAdapters);
    }

    initialize(){
        super.initialize();

        setImmediate(this.execute.bind(this));
    }
}

module.exports = TaskTriggerDirect;
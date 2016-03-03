'use strict';

var TaskTriggerBase = require('./task-trigger-base');

class TaskTriggerDirect extends TaskTriggerBase{

    constructor(task, type, options){
        super(task, type, options);
    }

    initialize(){
        super.initialize();

        this.task.execute(this.options);
    }
}

module.exports = TaskTriggerDirect;
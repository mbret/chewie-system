'use strict';

var TaskTriggerBase = require('./task-trigger-base');

/**
 * A trigger that is executed on user ask.
 */
class TaskTriggerManual extends TaskTriggerBase{

    constructor(system, task, id, type, options, messageAdapters){
        super(system, task, id, type, options, messageAdapters);
    }

    initialize(){
        super.initialize();
    }
}

module.exports = TaskTriggerManual;
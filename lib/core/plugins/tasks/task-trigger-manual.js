'use strict';

var TaskTriggerBase = require('./task-trigger-base');

/**
 * A trigger that is executed on user ask.
 */
class TaskTriggerManual extends TaskTriggerBase{

    constructor(system, task, id, options, outputAdapters){
        super(system, task, id, "manual", options, outputAdapters);
    }

    initialize(cb){
        super.initialize(cb);
    }
}

module.exports = TaskTriggerManual;
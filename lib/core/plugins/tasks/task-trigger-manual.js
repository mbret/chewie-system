'use strict';

var TaskTriggerBase = require('./task-trigger-base');

/**
 * A trigger that is executed on user ask.
 */
class TaskTriggerManual extends TaskTriggerBase{

    initialize(cb){
        super.initialize(cb);
    }
}

module.exports = TaskTriggerManual;
'use strict';

var DirectTaskTrigger = require('./task-trigger-direct');
var ScheduleTaskTrigger = require('./task-trigger-schedule');
var TriggerTaskTrigger = require('./task-trigger-trigger');
var ManualTaskTrigger = require('./task-trigger-manual');

class TaskTriggers{

    static Build(system, task, object){
        switch (object.type){
            case 'direct':
                return new DirectTaskTrigger(system, task, object.id, object.type, object.options, object.outputAdapters);
            case 'manual':
                return new ManualTaskTrigger(system, task, object.id, object.type, object.options, object.outputAdapters);
            case 'schedule':
                return new ScheduleTaskTrigger(system, task, object.id, object.type, object.options, object.outputAdapters, object.schedule);
            case 'trigger':
                return new TriggerTaskTrigger(system, task, object.id, object.type, object.options, object.outputAdapters, object.trigger);
            default:
                throw new Error('Unknown type provided');
        }
    }
}

module.exports = TaskTriggers;
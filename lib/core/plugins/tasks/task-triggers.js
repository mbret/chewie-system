'use strict';

var DirectTaskTrigger = require('./task-trigger-direct');
var ScheduleTaskTrigger = require('./task-trigger-schedule');
var TriggerTaskTrigger = require('./task-trigger-trigger');

class TaskTriggers{

    static Build(system, task, object){
        switch (object.type){
            case 'direct':
                return new DirectTaskTrigger(system, task, object.id, object.type, object.options, object.messageAdapters);
            case 'schedule':
                return new ScheduleTaskTrigger(system, task, object.id, object.type, object.options, object.messageAdapters, object.schedule);
            case 'trigger':
                return new TriggerTaskTrigger(system, task, object.id, object.type, object.options, object.messageAdapters, object.trigger);
            default:
                throw new Error('Unknown type provided');
        }
    }
}

module.exports = TaskTriggers;
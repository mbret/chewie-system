'use strict';

var DirectTaskTrigger = require('./task-trigger-direct');

class TaskTriggers{

    static Build(task, object){
        switch (object.type){
            case 'direct':
                return new DirectTaskTrigger(task, object.type, object.options, object.messageAdapters);
                break;
            default:
                throw new Error('Unkown type provided');
        }
    }
}

module.exports = TaskTriggers;
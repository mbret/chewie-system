'use strict';

var DirectTaskTrigger = require('./task-trigger-direct');

class TaskTriggers{

    static Build(object){
        switch (object.type){
            case 'direct':
                return new DirectTaskTrigger(object.type);
                break;
            default:
                throw new Error('Unkown type provided');
        }
    }
}

module.exports = TaskTriggers;
'use strict';

class TaskTriggerDirect extends require('./task-trigger-base'){

    constructor(type, options){
        super(type, options);
    }

    execute(){
        super.execute();

        var self = this;

        // Check if module is loaded
        if(!MyBuddy.userModules[task.module]){
            logger.debug('A task for the module [%s] has been ignored because the module is not loaded', task.module);
            return;
        }

        logger.debug('task of type [%s] executed for module [%s] with options [%s]', task.constructor.name, task.module, JSON.stringify(task.options));

        MyBuddy.emit(task.module + ':task:execute', task);
    }
}

module.exports = TaskTriggerDirect;
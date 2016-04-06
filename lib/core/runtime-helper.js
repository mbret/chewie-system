'use strict';
var _ = require('lodash');

class RuntimeHelper{

    constructor(system){
        this.system = system;
    }

    stopTask(taskId){
        return new Promise(function(resolve, reject){

            // retrieve correct task
            var taskIndex = null;
            _.forEach(this.system.tasks, function(task, index){
                if(task.id === taskId){
                    taskIndex = index;
                }
            });

            // stop the task
            if(taskIndex !== null){
                try{
                    this.system.tasks[taskIndex].stop();
                }
                catch(err){
                    return reject(err);
                }
                // unreference the object, no need to keep in memory.
                this.system.tasks.splice(taskIndex, 1);
            }

            // always return resolve if no errors.
            return resolve();
        });

    }
}

module.exports = RuntimeHelper;
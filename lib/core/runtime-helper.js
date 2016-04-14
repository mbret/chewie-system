'use strict';

var _ = require('lodash');
var logger = LOGGER.getLogger('RuntimeHelper');

class RuntimeHelper{

    constructor(system){
        this.system = system;
    }

    stopTask(taskId){
        var self = this;
        return new Promise(function(resolve, reject){

            // retrieve correct task
            var taskIndex = null;
            _.forEach(self.system.tasks, function(task, index){
                if(task.id === taskId){
                    taskIndex = index;
                }
            });

            if(taskIndex === null){
                var error = new Error('This task does not seems to be active');
                error.code = 'notFound';
                return reject(error);
            }

            // stop the task
            try{
                self.system.tasks[taskIndex].stop();
            }
            catch(err){
                return reject(err);
            }
            // unreference the object, no need to keep in memory.
            self.system.tasks.splice(taskIndex, 1);

            // always return resolve if no errors.
            return resolve();
        });
    }

    /**
     * Register the new task.
     *
     * We only register task if the module exist.
     *
     * @param {Task} task
     * @param {function} cb
     */
    registerTask(task, cb){

        var self = this;

        if(_.find(this.system.tasks, function(entry){
            return entry.id === task.id;
        }) !== undefined){
            var error = new Error('Task already running');
            error.code = 'alreadyRunning';
            return cb(error);
        }

        // Only register the task if the module is loaded
        if(!this.system.pluginsHandler.hasActiveModule(task.getModuleId())){
            logger.warn('Unable to register %s [%s] because its module [%s] does not seems loaded', task.constructor.name, task.getId(), task.getModuleId());
            return cb();
        }

        // Keep task in collection
        // The task is not active yet, just stored.
        this.system.tasks.push(task);
        this.system.tasksMap.set(task.getId(), task);

        logger.verbose('New %s [%s] registered for module [%s]', task.constructor.name, task.getId(), task.getModuleId());

        self.system.emit('task:registered:' + task.getModuleId(), task);

        task.on('stopped', function(){
            self.system.emit('task:stopped:' + task.getModuleId(), task);
        });

        task.on('execute', function(trigger){
            self.system.emit('task:execute:' + task.getModuleId(), trigger);
        });

        task.initialize(function(err){
            if(err){
                logger.error('A problem when initializing a task', err.stack);

                // remove the runtime task
                // ignore possible error when stopping
                self.stopTask(task.id, function(){
                    return cb(err);
                });
            }
            return cb();
        });
    }

    runTask(task, trigger){
        task.execute(trigger);
    }
}

module.exports = RuntimeHelper;
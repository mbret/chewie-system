'use strict';

var _ = require('lodash');
var async = require('async');

var logger          = LOGGER.getLogger('ModuleHandler');
var task            = require(CORE_DIR + '/plugins/tasks/task.js');
//var DirectTask      = require(CORE_DIR + '/plugins/tasks/direct-task.js');
//var TriggeredTask   = require(CORE_DIR + '/plugins/tasks/triggered-task.js');
//var ScheduledTask   = require(CORE_DIR + '/plugins/tasks/scheduled-task.js');

class ModuleHandler{

    constructor(system){
        this.system = system;
    }

    /**
     * Completely delete a module task.
     * @param task
     */
    static deleteTask(task){

        // clean task from runtime
        if(task instanceof ScheduledTask){
            // unSubscribe the schedule
            MyBuddy.scheduler.unSubscribe(task.scheduleProcess);
        }

        if(task instanceof TriggeredTask){
            throw new Error('Must be implemented');
        }

        _.remove(MyBuddy.tasks.userModules, function(tmp){
            return tmp.id === task.id
        });

        // clean task from db
        throw new Error('Must be implemented');
    }

    initializeModules(modules, done){

        async.forEachOf(modules, function(module, id, cb){
            logger.debug('Initialize module [%s]', module.id);
            var initialized = false;

            module.instance.initialize(function(err){
                initialized = true;
                return cb(err);
            });

            setTimeout(function(){
                if(!initialized){
                    logger.warn('The module [%s] seems to take abnormal long time to start!', module.id);
                }
            }, 1500);
        }, function(err){
            return done(err);
        });
    };

    /**
     * Register the new task.
     *
     * We only register task if the module exist.
     *
     * @param {Task|ScheduledTask} task
     * @param {function} cb
     */
    registerNewTask(task, cb){

        var self = this;

        // Check if module exist
        if(!MyBuddy.pluginsHandler.hasTaskModule(task.getModuleId(), task.getPluginId())){
            logger.warn('Unable to register %s [%s] because its module [%s] from [%s] does not exist', task.constructor.name, task.getId(), task.getModuleId(), task.getPluginId());
            return;
        }

        // Keep task in collection
        MyBuddy.tasks.userModules.push(task);
        logger.verbose('New %s [%s] registered for module [%s] from [%s]', task.constructor.name, task.getId(), task.getModuleId(), task.getPluginId());

        task.execute();

        return cb();
    }

    /**
     * Register and save the task in database (only for persistant tasks).
     * @param task
     * @param cb
     */
    registerAndSaveNewTask(task, cb){
        var self = this;
        this.registerNewTask(task, function(){
            self.saveUserTask(task, cb);
        });
    }

    saveUserTask(task, cb){
        var self = this;

        if(!(task instanceof Task)){
            return cb(new Error('Invalid task argument'));
        }

        // DirectTask case
        // We do not save now task, they are executed once
        if(task instanceof DirectTask){
            return cb();
        }

        // Other task case. Deferred
        // Otherwise save + execute for current process
        MyBuddy.database.saveTask(task, function(err, id){
            return cb(err);
        });
    }
}

module.exports = ModuleHandler;
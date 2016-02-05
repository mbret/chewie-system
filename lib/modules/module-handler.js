'use strict';

var _ = require('lodash');
var Tasks           = require(LIB_DIR + '/plugins/tasks/task.js');
var Task            = Tasks.Task;
var DirectTask      = Tasks.DirectTask;
var CommandedTask   = Tasks.CommandedTask;
var ScheduledTask   = Tasks.ScheduledTask;
var MovementCommandedTask = Tasks.MovementCommandedTask;
var ModuleScheduler   = require(LIB_DIR + '/modules/module-scheduler.js');
var async = require('async');
var logger = LOGGER.getLogger('ModuleHandler');

class ModuleHandler{

    constructor(system){

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

        _.remove(MyBuddy.tasks.userModules, function(tmp){
            return tmp.id === task.id
        });

        // clean task from db
        // @todo
    }

    static initializeModules(modules, done){

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
     *
     * @param {Task} task
     * @param {function} cb
     */
    registerNewTask(task, cb){

        var self = this;

        if(!(task instanceof Task)){
            return cb(new Error('Invalid task argument'));
        }

        // DirectTask case
        // We do not save now task, they are executed once
        if(task instanceof DirectTask){
            this._executeUserTask(task);
            return cb();
        }

        // Other task case. Deferred
        // Otherwise save + execute for current process
        MyBuddy.database.saveTask(task, function(err, id){
            if(err){
                return cb(err);
            }

            self._executeUserTask(task);
            return cb();
        });
    }

    /**
     * Private
     * @param task
     * @param moduleName
     */
    _executeUserTask(task, options){
        var self = this;

        if(!(task instanceof Task)){
            throw new Error('Invalid task type');
        }

        if(!options){
            options = {};
        }

        // Check if module is loaded
        if(!MyBuddy.userModules[task.module]){
            logger.debug('A task for the module [%s] has been ignored because the module is not loaded', task.module);
            return;
        }

        logger.debug('task of type %s added for module %s - ', task.constructor.name, task.module, task);

        if(task instanceof DirectTask){
            MyBuddy.emit(task.module + ':task:new', task);
        }
        else{

            // Keep task in collection
            MyBuddy.tasks.userModules.push(task);

            /*
             * ScheduledTask
             */
            if(task instanceof ScheduledTask){
                // Subscribe to a new scheduled task for the module
                var process = ModuleScheduler.subscribe(MyBuddy, task.module, 'user', task.schedule,
                    function onNow(){
                        MyBuddy.emit(task.module + ':task:new', task);
                    }
                );
                task.scheduleProcess = process;
            }
            else if(task instanceof MovementCommandedTask){
                this.movementDetector.watch(
                    function onEnter(){
                        task.options = task.optionsOnEnter;
                        MyBuddy.emit(task.module + ':task:new', task);
                    },
                    function onExit(){
                        task.options = task.optionsOnExit;
                        MyBuddy.emit(task.module + ':task:new', task);
                    }
                )
            }
            else if(task instanceof CommandedTask){
                // @todo
            }
        }
    }
}

module.exports = ModuleHandler;
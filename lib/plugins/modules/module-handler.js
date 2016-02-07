'use strict';

var _ = require('lodash');
var Tasks           = require(LIB_DIR + '/plugins/tasks/task.js');
var Task            = Tasks.Task;
var DirectTask      = Tasks.DirectTask;
var TriggeredTask   = require(LIB_DIR + '/plugins/tasks/triggered-task.js');
var ScheduledTask   = Tasks.ScheduledTask;
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
     * @param {Task|ScheduledTask} task
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
            logger.debug('New task of type [%s] registered for module [%s]', task.constructor.name, task.module);
            this._executeUserTask(task);
            return cb();
        }

        // Keep task in collection
        MyBuddy.tasks.userModules.push(task);
        logger.debug('New task of type [%s] registered for module [%s]', task.constructor.name, task.module);

        /*
         * ScheduledTask
         */
        if(task instanceof ScheduledTask){

            // Subscribe to a new scheduled task for the module
            var process = ModuleScheduler.subscribe(MyBuddy, task.module, 'user', task.schedule,
                function onNow(){
                    self._executeUserTask(task);
                }
            );
            task.scheduleProcess = process;
        }
        //else if(task instanceof MovementTriggeredTask){
        //    this.movementDetector.watch(
        //        function onEnter(){
        //            task.options = task.optionsOnEnter;
        //            MyBuddy.emit(task.module + ':task:new', task);
        //        },
        //        function onExit(){
        //            task.options = task.optionsOnExit;
        //            MyBuddy.emit(task.module + ':task:new', task);
        //        }
        //    )
        //}
        else if(task instanceof TriggeredTask){

            MyBuddy.emit(task.trigger.pluginId + ':' + task.trigger.id + ':trigger:new', task);
            //var taskCommander = MyBuddy.taskCommanders.get(commander);

            //taskCommander.watch(function(){
            //    task.options = task.optionsOnExit;
            //    MyBuddy.emit(task.module + ':trigger:new', task);
            //});
        }

        return cb();
    }

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

        MyBuddy.emit(task.module + ':task:execute', task);
    }
}

module.exports = ModuleHandler;
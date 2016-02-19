'use strict';

var _ = require('lodash');
var Task            = require(LIB_DIR + '/plugins/tasks/task.js');
var DirectTask      = require(LIB_DIR + '/plugins/tasks/direct-task.js');
var TriggeredTask   = require(LIB_DIR + '/plugins/tasks/triggered-task.js');
var ScheduledTask   = require(LIB_DIR + '/plugins/tasks/scheduled-task.js');
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

        if(task instanceof TriggeredTask){
            throw new Error('Must be implemented');
        }

        _.remove(MyBuddy.tasks.userModules, function(tmp){
            return tmp.id === task.id
        });

        // clean task from db
        throw new Error('Must be implemented');
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
     * Register the new task.
     * @param {Task|ScheduledTask} task
     * @param {function} cb
     */
    registerNewTask(task, cb){

        var self = this;

        if(!(task instanceof Task)){
            return cb(new Error('Invalid task argument'));
        }

        // DirectTask case
        // Throw directly the task trigger.
        // No need to keep the task internally. It's a one shot.
        if(task instanceof DirectTask){
            logger.verbose('New task of type [%s] registered for module [%s]', task.constructor.name, task.module);
            this._executeUserTask(task);
            return cb();
        }

        // ScheduledTask
        // We create a new subscription
        // The schedule will be handled automatically
        // On shedule executed, trigger the task execution
        if(task instanceof ScheduledTask){

            // Subscribe to a new scheduled task for the module
            var process = MyBuddy.scheduler.subscribe(task.schedule,
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

        // TriggeredTask
        // We just emit an event to ask the trigger module
        // to add its watcher on this specific task. The module will handle
        // by itself the task execution
        else if(task instanceof TriggeredTask){

            // Check if task trigger belong to an existing plugin & module
            if(!MyBuddy.pluginsHandler.hasPlugin(task.trigger.pluginId)){
                logger.warn('Unable to register %s [%s] because its trigger plugin [%s] does not exist', task.constructor.name, task.id, task.trigger.pluginId);
                return;
            }

            if(!MyBuddy.pluginsHandler.hasTaskTrigger(task.trigger.id, task.trigger.pluginId)){
                logger.warn('Unable to register %s [%s] because its trigger module [%s] from plugin [%s] does not exist', task.constructor.name, task.id, task.trigger.id, task.trigger.pluginId);
                return;
            }

            MyBuddy.emit(task.trigger.pluginId + ':' + task.trigger.id + ':trigger:new', task);
        }

        // Keep task in collection
        MyBuddy.tasks.userModules.push(task);
        logger.verbose('New %s [%s] registered for module [%s] from [%s]', task.constructor.name, task.id, task.module, '@todo');

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

    /**
     *
     * @param task
     * @param options
     * @private
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

        logger.debug('task of type [%s] executed for module [%s] with options [%s]', task.constructor.name, task.module, JSON.stringify(task.options));

        MyBuddy.emit(task.module + ':task:execute', task);
    }
}

module.exports = ModuleHandler;
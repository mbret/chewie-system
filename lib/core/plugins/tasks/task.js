'use strict';

var util = require('util');
var uuid = require('uuid');
var _ = require('lodash');
var TaskTriggers = require('./task-triggers');
var logger = LOGGER.getLogger('Task');

/**
 * Module task
 */
class Task{

    constructor(system, id, moduleId, options, triggers){

        this._checkArguments(arguments);

        this.system = system;
        this.id = id || uuid.v1();

        // General options for the task. same for any execution
        this.options = options;

        this.moduleId = moduleId;
        this.triggers = triggers || [];
    }

    _checkArguments(args){
        if(!args[2]) throw new Error('Module id invalid ' + args[2]);

        // options
        if(!_.isPlainObject(args[3])) throw new Error('Options invalid');
        if(!args[3].name){
            throw new Error('Attribute name missing from options');
        }
    }

    /**
     * Create a new task from literal object.
     * @param object
     * @constructor
     */
    static Build(object){
        var self = this;

        var task = new Task(object.system, object.id, object.moduleId, object.options);

        var triggers = [];
        _.forEach(object.triggers, function(trigger){
            triggers.push(TaskTriggers.Build(task, trigger));
        });
        task.setTriggers(triggers);

        return task;
    }

    toDb(){
        return {
            type: this.constructor.name,
            options: this.options,
            moduleId: this.moduleId,
            messageAdapters: this.messageAdapters,
            id: this.id,
            _id: this.id
        }
    }

    toJSON(){
        return this.toDb();
    }

    getId(){
        return this.id;
    }

    getModuleId(){
        return this.moduleId;
    }

    getPluginId(){
        return this.pluginId;
    }

    setTriggers(triggers){
        this.triggers = triggers;
    }

    /**
     *
     */
    initialize(){
        _.forEach(this.triggers, function(trigger){
            trigger.initialize();
        });
    }

    /**
     *
     * @param trigger
     * @private
     */
    _runTrigger(trigger){

        // DirectTask case
        // Throw directly the task trigger.
        // No need to keep the task internally. It's a one shot.
        if(trigger.type === 'direct'){
            logger.verbose('New task of type [%s] registered for module [%s]', task.constructor.name, task.module);
            this._executeUserTask(task);
            return cb();
        }

        // ScheduledTask
        // We create a new subscription
        // The schedule will be handled automatically
        // On shedule executed, trigger the task execution
        //if(task instanceof ScheduledTask){
        //
        //    // Subscribe to a new scheduled task for the module
        //    task.scheduleProcess = MyBuddy.scheduler.subscribe(task.schedule,
        //        function onNow(){
        //            self._executeUserTask(task);
        //        }
        //    );
        //}
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
        //else if(task instanceof TriggeredTask){
        //
        //    // Check if task trigger belong to an existing plugin & module
        //    if(!MyBuddy.pluginsHandler.hasPlugin(task.trigger.pluginId)){
        //        logger.warn('Unable to register %s [%s] because its trigger plugin [%s] does not exist', task.constructor.name, task.id, task.trigger.pluginId);
        //        return;
        //    }
        //
        //    if(!MyBuddy.pluginsHandler.hasTaskTrigger(task.trigger.id, task.trigger.pluginId)){
        //        logger.warn('Unable to register %s [%s] because its trigger module [%s] from plugin [%s] does not exist', task.constructor.name, task.id, task.trigger.id, task.trigger.pluginId);
        //        return;
        //    }
        //
        //    MyBuddy.emit(task.trigger.pluginId + ':' + task.trigger.id + ':trigger:new', task);
        //}
    }

    /**
     * Execute the task with the given context options.
     * @param contextOptions Options relative to the this execution.
     */
    execute(contextOptions){
        var event  = this.getModuleId() + ':task:execute';

        logger.debug('task [%s] executed for module [%s] with options [%s]', this.getId(), this.getModuleId(), JSON.stringify(contextOptions));

        MyBuddy.emit('task:execute:' + this.getModuleId(), this, contextOptions);
    }
}

module.exports = Task;

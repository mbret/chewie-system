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

    /**
     *
     * @param system
     * @param id
     * @param moduleId
     * @param options
     * @param triggers
     */
    constructor(system, id, moduleId, options, triggers){

        this._checkArguments(arguments);

        this.system = system;
        this.id = id || uuid.v4();

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
            triggers.push(TaskTriggers.Build(object.system, task, trigger));
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

    getOptions(){
        return this.options;
    }

    getTriggers(){
        return this.triggers;
    }

    setTriggers(triggers){
        this.triggers = triggers;
    }

    /**
     *
     */
    initialize(){
        var self = this;
        _.forEach(this.triggers, function(trigger){
            trigger.initialize();

            trigger.on('execute', function(){
                self.execute(trigger);
            });
        });
    }

    stop(){
        _.forEach(this.triggers, function(trigger){
            trigger.stop();
        });
    }

    /**
     *
     * @param trigger
     * @private
     */
    _runTrigger(trigger){


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
     * Execute the task with the given trigger as context.
     */
    execute(trigger){
        logger.verbose('task [%s] executed for module [%s] with options [%s]', this.getId(), this.getModuleId(), JSON.stringify(trigger.getOptions()));

        MyBuddy.emit('task:execute:' + this.getModuleId(), trigger);
    }

    /**
     * Completely stop an active task.
     * @param task
     */
    stop(){

        // Stop each triggers
        _.forEach(this.triggers, function(trigger){
            trigger.stop();
        });

        // clean task from db
        //throw new Error('Must be implemented');

        logger.verbose('Task [%s] stopped', this.id);
    }
}

module.exports = Task;

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
     * @param name
     * @param options
     * @param triggers
     */
    constructor(system, id, moduleId, name, options, triggers, userId){

        options = options || {};

        this.system = system;
        this.id = id || uuid.v4();
        this.userId = userId;

        // General options for the task. same for any execution
        // these options may be different for several tasks. These are not global task options.
        this.options = options;
        this.name = name;
        this.moduleId = moduleId;
        this.triggers = triggers || [];
        //this.userOptions = {};
    }

    /**
     * Create a new task from literal object.
     */
    static Build(system, object){
        var self = this;

        var task = new Task(system, object.id, object.module, object.name, object.options, null, object.userId);

        _.forEach(object.triggers, function(trigger){
            task.getTriggers().push(TaskTriggers.Build(system, task, trigger));
        });

        return task;
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

    /**
     *
     */
    initialize(cb){
        var self = this;
        _.forEach(this.triggers, function(trigger){
            trigger.initialize(function(err){
                if(err){
                    logger.error('A trigger is not able to initialize', err.stack);
                    return;
                }

                trigger.on('execute', function(){
                    self.execute(trigger);
                });
            });
        });

        return cb();
    }

    /**
     * Execute the task with the given trigger as context.
     */
    execute(trigger){
        logger.verbose('task [%s] executed for module [%s] with general options [%s] and context trigger [%s] with options [%s]', this.getId(), this.getModuleId(), JSON.stringify(this.getOptions()), trigger.getType(), JSON.stringify(trigger.getOptions()));

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

    isOnlyDirect(){
        var onlyDirect = true;
        _.forEach(this.getTriggers(), function(trigger){
            if(!trigger.isDirect()){
                onlyDirect = false;
            }
        });
        return onlyDirect;
    }

    toJSON(){
        return {
            id: this.id,
            userId: this.userId,
            triggers: this.triggers.map(function(trigger){
                return trigger.toJSON();
            })
        };
    }
}

module.exports = Task;

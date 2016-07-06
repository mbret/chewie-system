'use strict';

var util = require('util');
var uuid = require('uuid');
var _ = require('lodash');
var TaskTriggers = require('./task-triggers');
var EventEmitter = require('events');

/**
 * Module task
 */
class Task extends EventEmitter {

    constructor(system, id, userId, pluginId, moduleName, name, options){
        super();

        this.logger = system.logger.Logger.getLogger('Task');

        options = options || {};

        this.system = system;
        this.id = id || uuid.v4();
        this.userId = userId;

        // General options for the task. same for any execution
        // these options may be different for several tasks. These are not global task options.
        this.options = options;
        this.name = name;
        this.moduleId = pluginId + ":" + moduleName;
        this.moduleName = moduleName;
        this.pluginId = pluginId;
        this.triggers = [];
        this.triggersMap = new Map();

        //this.userOptions = {};
        var map = new Map();
    }

    /**
     * Create a new task from literal object.
     */
    static Build(system, object){
        var self = this;

        var task = new Task(system, object.id, object.userId, object.pluginId, object.moduleName, object.name, object.options);

        _.forEach(object.triggers, function(trigger){
            var instance = TaskTriggers.Build(system, task, trigger);
            task.getTriggers().push(instance);
            task.triggersMap.set(instance.getId(), instance);
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

    getName(){
        return this.name;
    }

    initialize(cb){
        var self = this;
        _.forEach(this.triggers, function(trigger){
            trigger.initialize(function(err){
                if(err){
                    self.logger.error('A trigger is not able to initialize', err.stack);
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
        this.logger.verbose('task [%s] executed for module [%s] with general options [%s] and context trigger [%s] with options [%s]', this.getId(), this.getModuleId(), JSON.stringify(this.getOptions()), trigger.getType(), JSON.stringify(trigger.getOptions()));

        this.emit('execute', trigger);
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

        this.logger.verbose('Task [%s] stopped', this.id);

        this.emit('stopped');
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

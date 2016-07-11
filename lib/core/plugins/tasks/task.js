'use strict';

var util = require('util');
var uuid = require('uuid');
var _ = require('lodash');
var TaskTriggers = require('./task-triggers');
var EventEmitter = require('events');

/**
 * Module task
 * 
 * A task is being executed when
 * - one of its trigger is executed
 */
class Task extends EventEmitter {

    constructor(system, id, userId, pluginId, moduleId, name, options, triggers){
        super();

        var self = this;
        this.logger = system.logger.Logger.getLogger('Task');

        options = options || {};

        this.system = system;
        this.id = id || uuid.v4();
        this.userId = userId;

        // General options for the task. same for any execution
        // these options may be different for several tasks. These are not global task options.
        this.options = options;
        this.name = name;
        this.moduleId = moduleId;
        this.moduleName = system.modules.get(moduleId).name;
        this.pluginId = pluginId;
        this.triggers = new Map();
        this.stopped = true;

        //this.userOptions = {};
        // var map = new Map();

        _.forEach(triggers, function(trigger){
            var instance = TaskTriggers.Build(system, self, trigger);
            self.triggers.set(self.id, instance);
        });
    }

    /**
     * Create a new task from literal object.
     */
    // static Build(system, object){
    //     var self = this;
    //
    //     var task = new Task(system, object.id, object.userId, object.pluginId, object.moduleName, object.name, object.options, object.triggers);
    //
    //     _.forEach(object.triggers, function(trigger){
    //         var instance = TaskTriggers.Build(system, task, trigger);
    //         task.getTriggers().push(instance);
    //         task.triggersMap.set(instance.getId(), instance);
    //     });
    //
    //     return task;
    // }
    
    /**
     * Initialize all triggers and listen for execute events
     * @param cb
     * @returns {*}
     */
    initialize(cb){
        var self = this;
        _.forEach(this.triggers.values(), function(trigger){
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
     * Execute the task with the given task trigger as context.
     */
    execute(trigger){
        this.logger.verbose('task [%s] executed for module [%s] with general options [%s] and context trigger [%s] with options [%s]', this.getId(), this.getModuleId(), JSON.stringify(this.getOptions()), trigger.getType(), JSON.stringify(trigger.getOptions()));

        this.emit('execute', trigger);
    }

    /**
     * Completely stop an active task.
     * - stop all triggers
     */
    stop(){
        if(this.stopped) {
            return;
        }

        this.stopped = true;
        // Stop each triggers
        _.forEach(this.triggers.values(), function(trigger){
            trigger.stop();
        });

        this.logger.verbose('Task [%s] stopped', this.id);
        this.emit('stopped');
    }

    /**
     * Start a task
     * - resume all triggers
     */
    start() {
        if(!this.stopped) {
            return;
        }

        this.stopped = false;
        // restart all triggers
        _.forEach(this.triggers.values(), function(trigger){
            trigger.start();
        });
        this.emit('started');
    }

    // isOnlyDirect(){
    //     var onlyDirect = true;
    //     _.forEach(this.getTriggers(), function(trigger){
    //         if(!trigger.isDirect()){
    //             onlyDirect = false;
    //         }
    //     });
    //     return onlyDirect;
    // }

    // toJSON(){
    //     return {
    //         id: this.id,
    //         userId: this.userId,
    //         triggers: this.triggers.map(function(trigger){
    //             return trigger.toJSON();
    //         })
    //     };
    // }
}

module.exports = Task;

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
    constructor(system, id, moduleId, name, options, triggers){

        options = options || {};

        this._checkArguments(arguments);

        this.system = system;
        this.id = id || uuid.v4();

        // General options for the task. same for any execution
        // these options may be different for several tasks. These are not global task options.
        this.options = options;
        this.name = name;
        this.moduleId = moduleId;
        this.triggers = triggers || [];

        //this.userOptions = {};
    }

    _checkArguments(args){
        if(!args[2]) throw new Error('Module id invalid ' + args[2]);
        if(!args[3]) throw new Error('name invalid ' + args[3]);

        // options
        if(!_.isPlainObject(args[4])) throw new Error('Options invalid');
    }

    /**
     * Create a new task from literal object.
     * @param object
     * @constructor
     */
    static Build(system, object){
        var self = this;

        var task = new Task(system, object.id, object.moduleId, object.name, object.options);

        _.forEach(object.triggers, function(trigger){
            task.getTriggers().push(TaskTriggers.Build(system, task, trigger));
        });

        return task;
    }

    toDb(){
        return _.merge(this.toJSON(), {
            triggers: this.triggersToDB(),
            _id: this.id
        });
    }

    toJSON(){
        return {
            type: this.constructor.name,
            options: this.options,
            moduleId: this.moduleId,
            name: this.name,
            triggers: this.triggersToJSON(),
            id: this.id,
        };
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

    triggersToJSON(){
        var res = [];
        _.forEach(this.triggers, function(trigger){
            res.push(trigger.toJSON());
        });
        return res;
    }

    triggersToDB(){
        var res = [];
        _.forEach(this.triggers, function(trigger){
            res.push(trigger.toDb());
        });
        return res;
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

    /**
     * Execute the task with the given trigger as context.
     */
    execute(trigger){
        logger.verbose('task [%s] executed for module [%s] with general options [%s] and context options [%s]', this.getId(), this.getModuleId(), JSON.stringify(this.getOptions()), JSON.stringify(trigger.getOptions()));

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
}

module.exports = Task;

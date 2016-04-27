'use strict';

var TaskTriggerBase = require('./task-trigger-base');
var _ = require('lodash');
var sprintf = require("sprintf-js").sprintf;

class TaskTriggerTrigger extends TaskTriggerBase{

    /**
     *
     * @param {Daemon} system
     * @param task
     * @param id
     * @param type
     * @param options
     * @param outputAdapters
     * @param trigger
     */
    constructor(system, task, id, type, options, outputAdapters, trigger){
        super(system, task, id, type, options, outputAdapters);

        this.logger = system.logger.Logger.getLogger('TaskTriggerTrigger');

        trigger = trigger || {};
        if(!trigger.id){
            throw new Error('Invalid trigger object, id required');
        }

        this.trigger = trigger;
    }

    initialize(){
        super.initialize();

        var self = this;

        if(!this.system.pluginsHandler.hasTaskTrigger(this.trigger.id)){
            var message = sprintf('Task [%s]: Unable to initialize trigger [%s] because its trigger module [%s] does not exist', this.task.getId(), this.id, this.trigger.id);
            self.logger.warn(message);
            this.system.notificationService.push('warning', message);
            return;
        }

        // get trigger instance
        var trigger = (_.find(this.system.triggers, { id: this.trigger.id }));

        trigger.watch(this.trigger.options, function(){
            self.execute();
        });
    }

    toDb(){
        return _.merge(super.toDb(), {
            trigger : this.trigger,
        });
    }
}

module.exports = TaskTriggerTrigger;
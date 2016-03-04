'use strict';

var TaskTriggerBase = require('./task-trigger-base');
var _ = require('lodash');

class TaskTriggerTrigger extends TaskTriggerBase{

    constructor(system, task, id, type, options, messageAdapters, trigger){
        super(system, task, id, type, options, messageAdapters);

        this.trigger = trigger;
    }

    initialize(){
        super.initialize();

        var self = this;

        var trigger = (_.find(this.system.taskTriggers, { id: this.trigger.id }));

        trigger.watch(this.trigger.options, function(){
            self.execute();
        });
    }
}

module.exports = TaskTriggerTrigger;
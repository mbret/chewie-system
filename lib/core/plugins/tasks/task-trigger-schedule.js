'use strict';

var TaskTriggerBase = require('./task-trigger-base');

class TaskTriggerSchedule extends TaskTriggerBase{

    constructor(system, task, id, type, options, messageAdapters, schedule){
        super(system, task, id, type, options, messageAdapters);

        this.schedule = schedule;
        this.scheduleProcess = null;
    }

    initialize(){
        super.initialize();

        var self = this;

        // Subscribe to a new scheduled task for the module
        this.scheduleProcess = this.system.scheduler.subscribe(this.schedule, function(e){
            self.execute();
        });
    }

    stop(){
        this.system.scheduler.unSubscribe(this.scheduleProcess);
    }
}

module.exports = TaskTriggerSchedule;
'use strict';

var TaskTriggerBase = require('./task-trigger-base');

class TaskTriggerSchedule extends TaskTriggerBase{

    constructor(system, task, id, type, options, messageAdapters, schedule){
        super(system, task, id, type, options, messageAdapters);

        console.log('TaskTriggerSchedule', options, schedule);
        this.schedule = schedule;
        this.scheduleProcess = null;
    }

    initialize(cb){
        var self = this;

        super.initialize(function(err){
            if(err){
                return cb(err);
            }

            // Subscribe to a new scheduled task for the module
            self.scheduleProcess = self.system.scheduler.subscribe(self.schedule, function(e){
                self.execute();
            });

            if(self.scheduleProcess === null){
                return cb(new Error('Invalid schedule, unable to start'));
            }
            return cb();
        });
    }

    stop(){
        this.system.scheduler.unSubscribe(this.scheduleProcess);
    }
}

module.exports = TaskTriggerSchedule;
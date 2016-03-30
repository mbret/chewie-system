'use strict';
var logger = LOGGER.getLogger('TaskTriggerSchedule');
var TaskTriggerBase = require('./task-trigger-base');
var scheduler = require('node-schedule');
var moment = require('moment');

class TaskTriggerSchedule extends TaskTriggerBase{

    constructor(system, task, id, type, options, messageAdapters, schedule){
        super(system, task, id, type, options, messageAdapters);

        this.schedule = schedule;
        this.job = null;
    }

    initialize(cb){
        var self = this;

        super.initialize(function(err){
            if(err){
                return cb(err);
            }

            // Subscribe to a new scheduled task for the module
            if(self.schedule.method === 'interval'){
                var process = setInterval(function(){
                    self.execute();
                }, self.schedule.interval);

                // create custom job to match node-schedule
                self.job = {
                    nextInvocation: function(){
                        var nextTick = moment();
                        nextTick.add(self.schedule.interval, 'ms');
                        return nextTick;
                    }
                };
            }
            else{
                if(self.schedule.date){
                    rule = self.schedule.date;
                }
                else{
                    var rule = new scheduler.RecurrenceRule();
                    rule.date = self.schedule.date || rule.Date;
                }

                // job may be null for past events
                // ex date = now() will not be triggered and get null
                self.job = scheduler.scheduleJob(rule, function(e){
                    self.execute();
                });
            }

            if(self.job === null){
                logger.debug('Trigger %s for task %s belong to past and has been ignored', self.getId(), self.task.getId());
            }

            return cb();
        });
    }

    stop(){
        throw new Error('todo');
    }

    nextInvocation(){
        if(this.job === null){
            return null;
        }
        return this.job.nextInvocation().toString();
    }
}

module.exports = TaskTriggerSchedule;
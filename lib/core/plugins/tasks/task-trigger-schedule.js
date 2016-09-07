'use strict';
var TaskTriggerBase = require('./task-trigger-base');
var scheduler = require('node-schedule');
var moment = require('moment');
var _ = require('lodash');

class TaskTriggerSchedule extends TaskTriggerBase{

    constructor(system, task, id, type, options, outputAdapters, schedule){
        super(system, task, id, type, options, outputAdapters);

        this.logger = system.logger.Logger.getLogger('TaskTriggerSchedule');

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
                    },
                    cancel: function(){
                        clearInterval(process);
                    }
                };
            }
            else{
                // Case of date, RecurrenceRule does not work we need to pass date object.
                if(self.schedule.date){
                    rule = self.schedule.date;
                }
                else{
                    var rule = new scheduler.RecurrenceRule();
                    rule.year = Number.isInteger(self.schedule.year) ? self.schedule.year : rule.year;
                    rule.month = Number.isInteger(self.schedule.month) ? self.schedule.month : rule.month;
                    rule.hour = Number.isInteger(self.schedule.hour) ? self.schedule.hour : rule.hour;
                    rule.minute = Number.isInteger(self.schedule.minute) ? self.schedule.minute : rule.minute;
                    rule.second = Number.isInteger(self.schedule.second) ? self.schedule.second : rule.second;
                    rule.dayOfWeek = self.schedule.dayOfWeek || rule.dayOfWeek;
                }

                // job may be null for past events
                // ex date = now() will not be triggered and get null
                self.job = scheduler.scheduleJob(rule, function(e){
                    self.execute();
                });
            }

            if(self.job === null){
                self.logger.debug('Trigger %s is one shot and belong to past and has been ignored', self.getId());
            }

            return cb();
        });
    }

    stop(){
        this.job.cancel();
    }

    nextInvocation(){
        if(this.job === null){
            return null;
        }
        return this.job.nextInvocation().toISOString();
    }

    toJSON(){
        var self = this;
        return _.merge(super.toJSON(), {
            nextInvocation: self.nextInvocation()
        });
    }
}

module.exports = TaskTriggerSchedule;
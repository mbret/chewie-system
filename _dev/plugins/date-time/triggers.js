"use strict";

let schedule = require('node-schedule');

class Trigger {

    constructor(helper, info) {
        this.info = info;
        this.helper = helper;
        this.interval = null;
    }

    onNewDemand(options, cb, done) {
        let self = this;
        if (this.info.id === "interval") {
            this.interval = this._watchInterval(options, cb);
        } else if (this.info.id === "date") {
            this._watchDate(options, cb);
        } else if (this.info.id === "timeout") {
            this.interval = this._watchTimeout(options, function(res) {
                self.stop();
                // trigger cb
                cb(res);
                // end of trigger module
                return done();
            });
        } else if (this.info.id === "hoursRange") {
            this._watchHoursRange(options, cb);
        }
    }

    stop() {
        clearInterval(this.interval);
    }

    _watchInterval(options, cb) {
        let self = this;
        return setInterval(function() {
            cb(self.buildRes());
        }, options.interval);
    }

    _watchDate(options, cb) {
        let date = new Date(options.date);
        schedule.scheduleJob(date, function(){
            return cb();
        });
    }

    _watchTimeout(options, cb) {
        let self = this;
        return setTimeout(function() {
            cb(self.buildRes());
        }, options.timeout);
    }

    _watchHoursRange(options, cb) {
        let fromDate = new Date(options.from);
        let persistUntil = !!options.to;
        let now = new Date();
        let repeat = options.repeat;

        let ruleFrom = new schedule.RecurrenceRule();
        ruleFrom.hour = fromDate.getHours();
        ruleFrom.minute = fromDate.getMinutes();
        if (options.days && Array.isArray(options.days)) {
            ruleFrom.dayOfWeek = options.days.map( item => parseInt(item) );
            // force reapeat when using days
            repeat = true;
        }

        this.helper.logger.verbose("New demand for watch hours range with schedule rule %s" + (persistUntil ? " and persist range until " + (new Date(options.to)).toTimeString() : ""), require("util").inspect(ruleFrom));

        // execute classic schedule for the from time
        let j = schedule.scheduleJob(ruleFrom, function() {
            cb({
                dateTime: new Date()
            });
            if (!repeat) {
                j.cancel();
            }
        });

        if (persistUntil) {
            let toDate = new Date(options.to);
            // In case the time is in past we have to test the "toDate" to potentially trigger
            // we need to set the same day/month/year for all date to make sure we compare only hours. Also now date must be reset to 0 seconds & ms.
            fromDate.setMonth(now.getMonth());
            fromDate.setDate(now.getDate());
            fromDate.setFullYear(now.getFullYear());
            toDate.setMonth(now.getMonth());
            toDate.setDate(now.getDate());
            toDate.setFullYear(now.getFullYear());
            toDate.setSeconds(0);
            fromDate.setSeconds(0);
            now.setSeconds(0, 0);
            if (
                // has day
                (
                    (ruleFrom.dayOfWeek && ruleFrom.dayOfWeek.indexOf(now.getDay())) !== -1
                    || !ruleFrom.dayOfWeek
                )
                && fromDate.getTime() < now.getTime()
            ) {
                    if (toDate.getTime() >= now.getTime()) {
                        cb({
                            dateTime: new Date()
                        });
                    }
            }
        }
    }

    _watchTime(options, cb) {
        let rule = new schedule.RecurrenceRule();
        rule.hour = options.hour;
        rule.minute = options.minutes;
        let j = schedule.scheduleJob(rule, function() {
            cb();
            if (!options.repeat) {
                j.cancelJob();
            }
        });
    }

    buildRes() {
        return {
            dateTime: new Date()
        };
    }
}

module.exports = Trigger;
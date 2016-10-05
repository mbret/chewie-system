"use strict";

var schedule = require('node-schedule');

class Trigger {

    constructor(helper, info) {
        this.info = info;
    }

    onNewDemand(options, cb) {
        if (this.info.id === "interval") {
            this._watchInterval(options, cb);
        } else if (this.info.id === "date") {
            this._watchDate(options, cb);
        } else if (this.info.id === "timeout") {
            this._watchTimeout(options, cb);
        }
    }

    _watchInterval(options, cb) {
        setInterval(function() {
            cb();
        }, options.interval);
    }

    _watchDate(options, cb) {
        var date = new Date(options.date);
        console.info("Watch for date", date.toString());
        var job = schedule.scheduleJob(date, function(){
            return cb();
        });
    }

    _watchTimeout(options, cb) {
        setTimeout(function() {
            cb();
        }, options.timeout);
    }
}

module.exports = Trigger;
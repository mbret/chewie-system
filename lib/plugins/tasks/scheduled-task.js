'use strict';

var Task = require('./task.js');

/**
 *
 */
class ScheduledTask extends Task{

    /**
     *
     * @param module
     * @param messageAdapters
     * @param options
     * @param schedule
     */
    constructor(id, module, messageAdapters, options, schedule){
        super(id, module, messageAdapters, options);

        this.schedule = schedule;
        this.scheduleProcess = null;

        if(this.schedule.method === "moment"){

            // restricted days
            if(!Array.isArray(this.schedule.when[2])){
                this.schedule.when[2] = [];
            }
        }
    }

    /**
     *
     */
    toDb(){
        return _.merge(super.toDb(), {
            schedule: this.schedule,
        });
    }
}

module.exports = ScheduledTask;
'use strict';

var Task = require('./task.js').Task();
var _ = require('lodash');

/**
 *
 */
class ScheduledTask extends Task{

    /**
     *
     * @param id
     * @param module
     * @param pluginId
     * @param messageAdapters
     * @param options
     * @param schedule
     */
    constructor(id, module, pluginId, messageAdapters, options, schedule){
        super(id, module, pluginId, messageAdapters, options);

        this.schedule = schedule;
        this.scheduleProcess = null;
    }

    /**
     *
     */
    toDb(){
        return _.merge(super.toDb(), {
            schedule: this.schedule,
        });
    }

    toJSON(){
        return _.merge(super.toJSON(), {
            schedule: this.schedule,
            nextTick: this.scheduleProcess.nextTick
        });
    }
}

module.exports = ScheduledTask;
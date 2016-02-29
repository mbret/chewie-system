'use strict';

var Process = require('./process');

/**
 *
 */
class ScheduleProcess extends Process {

    constructor(scheduler, method, schedule, timerObject){
        super(scheduler, method, schedule, null);
        this.fromProcess = null;
        this.toProcess = null;
    }

}

module.exports = ScheduleProcess;
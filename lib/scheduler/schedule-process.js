'use strict';

var _ = require('lodash');
var logger = LOGGER.getLogger('ScheduleProcess');

/**
 *
 */
class ScheduleProcess{

    constructor(method, when, interval, timerObject){
        this.method = method;
        this.when = when;
        this.interval = interval;
        this.timerObject = timerObject;
    }

}

module.exports = ScheduleProcess;
'use strict';

/**
 *
 */
class ScheduleProcess {

    constructor(scheduler, method, when, interval, timerObject){
        this.scheduler = scheduler;
        this.method = method;
        this.when = when;
        this.interval = interval;
        this.timerObject = timerObject;
        //console.log(timerObject);
        //timerObject._onTimeout(function(){
        //})
        //timerObject.on('timeout', function(){
        //    console.log('s');
        //
        //});
    }

    /**
     * Invalidate the job.
     */
    cancel(){
        clearTimeout(this.timerObject);
        this.timerObject = null;
    }

    restart(){
        throw new Error('Must be implemented');
    }
}

module.exports = ScheduleProcess;
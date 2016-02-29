'use strict';

/**
 *
 */
class ScheduleProcess {

    constructor(scheduler, method, schedule, timerObject){
        this.scheduler = scheduler;
        this.method = method;
        this.schedule = schedule;
        this.timerObject = timerObject;

        // date for the next tick
        this.nextTick = null;
    }

    setTimerObject(o){
        this.timerObject = o;
    }

    getTimerObject(){
        return this.timerObject;
    }

    /**
     * Invalidate the job.
     */
    cancel(){
        clearTimeout(this.timerObject);
        this.timerObject = null;
    }

    /**
     * Restart the job.
     */
    restart(){
        this.cancel();
        this.setTimerObject(this._renewTimer());
    }

    /**
     * Renew a new timer for this object.
     * This method is overwritten by scheduler dynamically.
     */
    _renewTimer(){
        throw new Error('Oops it should have been overwriten by shceduler');
    }
}

module.exports = ScheduleProcess;
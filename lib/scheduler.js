'use strict';

var _ = require('lodash');
var moment = require('moment');
var logger = LOGGER.getLogger('Scheduler');

var schedulerInstances = [];

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

/**
 *
 */
class Scheduler{

    constructor(daemon){
        this.daemon = daemon;

        // [ScheduleProcess]
        this.schedules = [];

        schedulerInstances.push(this);
    }

    //static getAllSchedulers(){
    //    return schedulerInstances;
    //}

    /**
     *
     * @returns {ScheduleProcess[]}
     */
    getSchedules(){
        return this.schedules;
    }

    /**
     *
     * @param {ScheduleProcess} scheduleProcess
     */
    saveSchedule(method, when, interval, timerObject){
        var self = this;
        // Save this schedule
        var scheduleProcess = new ScheduleProcess(method, when, interval, timerObject);
        self.schedules.push(scheduleProcess);
        return scheduleProcess;
    }

    /**
     *
     * Accept as when value: "myDate", ["myDate", "format", ...], [ ["myDate", "format", ...], ... ]
     * @param schedule
     * {
     *      method: "interval",
     *      interval: 1000
     * }
     * @param values
     * @return {ScheduleProcess[]|ScheduleProcess}
     */
    subscribe(schedule, cb, cb2){

        var self = this;
        var timerObject = null;

        if(!schedule){
            return null;
        }

        if(Array.isArray(schedule)){
            return this.subscribeMultiple(schedule, cb, cb2);
        }

        // Interval schedule
        if(schedule.method === "interval"){
            timerObject = self._subscribeInterval(schedule.interval, cb);
        }

        // Moment schedule
        else if(schedule.method === "moment"){
            // ["12:00", "HH:mm"]
            if(Array.isArray(schedule.when)){
                timerObject = self._subscribeMoment(schedule.when, cb);
            }
            // "12:00"
            else{
                timerObject = self._subscribeMoment(schedule.when, cb);
            }
        }

        // Range
        // Two callback, one called whenever the from is reached (also if we are already in)
        // second cb called when we leave the range
        else if (schedule.method === "range"){
             var timers = self._subscribeRange(
                schedule.from,
                schedule.to,
                schedule.format,
                cb,
                cb2
            );
            // Create fake timerObject for range. It will contain both timerFunctions and the from timerFunction as id
            timerObject = { from: timers[0], to: timers[1], _idleTimeout: timers[0]._idleTimeout };
        }

        else if(schedule.method === "now"){
            logger.verbose("Module [%s] requested schedule: now ", this.moduleName);
            cb();
        }

        if(timerObject){
            return self.saveSchedule(schedule.method, schedule.when, schedule.interval, timerObject);
        }

        return null;
    }

    /**
     *
     * @param schedules
     * @param cb
     * @param cb2
     * @returns {ScheduleProcess[]}
     */
    subscribeMultiple(schedules, cb, cb2){
        var self = this;
        var scheduleProcesses = [];
        _.forEach(schedules, function(schedule){
            scheduleProcesses.push(self.subscribe(schedule, cb, cb2));
        });
        return scheduleProcesses;
    }

    /**
     *
     * @param {ScheduleProcess} scheduleProcess
     * @returns {*}
     */
    unSubscribe(scheduleProcess){

        if(Array.isArray(scheduleProcess)){
            return this.unSubscribeMultiple(scheduleProcess);
        }

        // clearTimeout handle both interval / timeout
        clearTimeout(scheduleProcess.timerObject);
    }

    /**
     *
     * @param {ScheduleProcess[]} scheduleProcess
     */
    unSubscribeMultiple(scheduleProcess){
        throw new Error('todo');
        var self = this;
        _.forEach(scheduleProcess, function(daemon){
            self.unSubscribe(daemon);
        });
    }

    _getNextDay(currentDay, restrictDays){

        // asc
        restrictDays.sort();

        var pos = restrictDays.indexOf(currentDay);

        // Not in the list of days
        if(pos < 0){

            // Try to get the first higher day
            // Otherwise just return the next first day (for example monday) + one week
            var higher = null;
            _.forEach(restrictDays, function(day){
                if(day <= 7 && day > currentDay){
                    higher = day;
                }
            });
            if(higher !== null){
                return higher;
            }
            return restrictDays[0] + 7;
        }

        if(pos == restrictDays.length - 1){
            return currentDay;
        }

        if(pos < restrictDays.length - 1){
            return restrictDays[pos + 1];
        }

        return currentDay;
    }

    /**
     *
     * @param when
     * @param format
     * @returns {*}
     * @param options
     * @param restrictDays
     * @param {boolean} acceptEqualsMomentByFormat (default: false) Used to allow the comparison between now and to with the format in parameter.
     * It handle for example 11:22 and (now as 11:22). Otherwise 11:22:00 could be different than (now as 11:22:12..).
     * The downside is than until 11:22 is not over (11:23) the function that call getNextMomentTick() will loop.
     */
    getNextMomentTick(when, format, options, restrictDays, acceptEqualsMomentByFormat){

        if(!acceptEqualsMomentByFormat) acceptEqualsMomentByFormat = false;
        if(!restrictDays) restrictDays = [];
        if(!options) options = {};

        // Get next tick
        var now = moment();
        var to = moment(when, format);
        var waitFor = null;

        // First check if both date are equal with format
        // It handle for example 11:22 and (now as 11:22). Otherwise 11:22:00 could be different than (now as 11:22:12..)
        // Same problem with month, day, ...
        if(acceptEqualsMomentByFormat && (now.format(format) === to.format(format))){
            waitFor = 0;
        }
        // Here is important path
        // If format doesn't contain year. It means that the moment have to be repeated for tomorrow
        // So if we do not have year AND date is past then do it again with tomorrow
        else{
            waitFor = to.diff(now);
        }

        logger.debug('check next tick from %s to %s. Result %s s / %s m / %s h / %s d', now.format(), to.format(), waitFor / 1000, waitFor / 1000 / 60, waitFor / 1000 / 60 / 60, waitFor / 1000 / 60 / 60 / 24);

        // 32 Bits limit
        if(waitFor > Scheduler.x32Bit_NUMBER_LIMIT){
            logger.debug('waitFor is too huge number (over than 32 bit supported)', waitFor);
            var err = new Error('getNextMomentTick Maximum of 32 bits number reached');
            err.code = "MAXIMUM_x32";
            throw err;
        }

        // For some format. Once we arrive in past we need to set the next day/month/year because
        // the moment have to be repeated because 19:00 is an hour for every day.
        // Using option noRepeat allow us to retrieve negative tick (for example to know if the tick is passed)
        if(options.repeat !== false && waitFor < 0){

            logger.debug('Scheduled moment is negative. Trying to determine new date based on format [%s]', format);

            // If only minutes are set, we should check for next hours
            if([Scheduler.FORMATS.MINUTES].indexOf(format) !== -1){
                to.add(1, 'hours');
                waitFor = this.getNextMomentTick(to, format);
            }

            // If we only specify hours. We should repeat this moment for tomorrow too
            if([Scheduler.FORMATS.HOURS, "HH:mm",].indexOf(format) !== -1){
                to.add(1, 'days');
                waitFor = this.getNextMomentTick(to, format);
            }

            if(["DD", "DD HH", "DD HH:mm"].indexOf(format) !== -1){
                to.add(1, 'months');
                waitFor = this.getNextMomentTick(to, format);
            }

            if(["MM", "MM-DD", "MM-DD HH", "MM-DD HH:mm"].indexOf(format) !== -1){
                to.add(1, 'years');
                waitFor = this.getNextMomentTick(to, format);
            }
        }

        // Now that we have a valid next date we need to fix the day of week for the next tick
        // In case of specific days has been set in config
        // We need to generate the next tick relative to the next specified day
        // ex 12:00 for monday and we are tuesday. We need to add 6 day to the date to be at
        // 12:00 of monday
        // -> That's only relevant for hours
        if(["HH", "HH:mm",].indexOf(format) !== -1 && restrictDays.length > 0){

            // Return either the current day or the next scheduled day for this date
            // The selector look like the day number + eventually one week if the next day is before the current day
            var daySelector = this._getNextDay(to.weekday(), restrictDays);
            to.day(daySelector);
            if(daySelector !== to.weekday()){
                waitFor = this.getNextMomentTick(to, format);
            }
        }

        return waitFor;
    }

    _subscribeInterval(interval, cb){
        logger.verbose("Module [%s] requested schedule: interval of %s.", this.moduleName, interval);
        if(interval > Scheduler.x32Bit_NUMBER_LIMIT){
            throw new Error('Interval value too high. 32bits number limit is ' + Scheduler.x32Bit_NUMBER_LIMIT + '. You are using ' + interval);
        }
        var scheduleDaemon = setInterval(function(){
            return cb();
        }, interval);
        return scheduleDaemon;
    }

    /**
     *
     * @param {Array|string} when
     * "12:00" | ["12:00", "HH:mm", ...]
     * @param cb
     * @returns {*}
     * @private
     */
    _subscribeMoment(when, cb){
        var self = this;
        var scheduleDaemon = null;
        var momentDate = null;
        var format = null;
        var restrictedDays = [];

        // Extract date + format + specific days from schedule.when object
        if(!Array.isArray(when)){
            momentDate = when;
        }
        else{
            momentDate = when[0];
            format = when[1];
            if(when.length > 2){
                restrictedDays = when[2];
            }
        }

        logger.verbose("Module [%s] requested schedule: moment for [moment:%s] [format:%s] [days:%s].", this.moduleName, momentDate, format, restrictedDays.join(','));

        /**
         * @param {boolean} acceptNowMoment When true we accept to have a tick for now. (same date with format)
         */
        (function loop(acceptNowMoment) {
            var numberTooLarge = false;
            try{
                var waitFor = self.getNextMomentTick(momentDate, format, null, restrictedDays, acceptNowMoment);
            }
            catch(err){
                if(err.code === "MAXIMUM_x32"){
                    numberTooLarge = true;
                }
                else{
                    throw err;
                }
            }

            // waitFor is not a valid 32 bit (too large) so we need to temporize loop
            // To be sure that the temporizing will not skip accidentally timeout we use the 32bit limit.
            // We will never timeout after the waitFor like this.
            if(numberTooLarge){
                scheduleDaemon = setTimeout(function() {
                    console.log('timeout temporized');
                    loop();
                }, Scheduler.x32Bit_NUMBER_LIMIT);
            }
            else{
                if(waitFor < 0){
                    logger.verbose("Module [%s] schedule moment is related to past. No schedule planned!", self.moduleName);
                }
                else{
                    logger.verbose("Module [%s] schedule moment will be call in %s seconds / %s minutes / %s h / %s d.", self.moduleName, (waitFor / 1000).toFixed(2), (waitFor / 1000 / 60).toFixed(2), (waitFor / 1000 / 60 / 60).toFixed(2), (waitFor / 1000 / 60 / 60 / 24).toFixed(2));
                    scheduleDaemon = setTimeout(function() {
                        cb();
                        // false ensure we will not loop on the same date until the next (day, hours, ...) pass.
                        loop(false);
                    }, waitFor);
                }
            }
        }(true));
        return scheduleDaemon;
    }

    /**
     *
     * @param from
     * @param to
     * @param cb
     * @param cb2
     * @returns {Array} array of schedules
     */
    _subscribeRange(from, to, format, cb, cb2){
        var scheduleDaemons = [];

        // Handle the particular case when we are already in the range
        var fromTick = this.getNextMomentTick(from, format, {repeat: false});
        var toTick = this.getNextMomentTick(to, format, {repeat: false});
        if(fromTick < 0 && toTick > 0){
            cb();
        }

        // Get entered moment
        scheduleDaemons.push(this._subscribeMoment([from, format], function(){
            return cb();
        }));

        // Get left moment
        scheduleDaemons.push(this._subscribeMoment([to, format], function(){
            return cb2();
        }));

        return scheduleDaemons;
    }
}

Scheduler.x32Bit_NUMBER_LIMIT = 2147483647;

// FORMATS use 24 hour time
Scheduler.FORMATS = {
    MINUTES: 'mm',
    HOURS: 'HH'
};

module.exports = Scheduler;
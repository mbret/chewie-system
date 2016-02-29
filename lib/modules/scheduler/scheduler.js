'use strict';

var _               = require('lodash');
var moment          = require('moment');
var ScheduleProcess = require('./process.js');
var config          = require('./config.js');

/**
 * This event is passed to schedule timeout callback.
 * For some specific rules it can provide useful information.
 * Example with range, it include the enter / exit option.
 */
class ScheduleEvent{
    constructor(options){
        if(!options){
            options = {};
        }

        // range specific
        this.enter = options.enter;
        this.exit = options.exit;
    }
}

/**
 *
 */
class Scheduler{

    constructor(){}

    /**
     *
     * Accept as when value: "myDate", ["myDate", "format", ...], [ ["myDate", "format", ...], ... ]
     *
     * - subscribe an interval:
     *  {
     *      method: 'interval',
     *      interval: '1000'
     *  }
     *
     *  - subscribe a moment:
     *      The when attribute may be a valid js date or a string with specified format.
     *  {
     *      method: 'moment',
     *      when:
     *  }
     *
     * @param schedule object
     * @param cb function
     * @return {ScheduleProcess[]|ScheduleProcess}
     */
    subscribe(schedule, cb){

        var self = this;
        var scheduleProcess = null;

        if(!schedule){
            throw new Error('Please provide a valid schedule');
        }

        // Interval schedule
        if(schedule.method === "interval"){
            scheduleProcess = self._subscribeInterval(schedule, function(){
                cb(new ScheduleEvent());
            });
        }

        // Moment schedule
        else if(schedule.method === "moment"){

            // verify schedule object
            if(!schedule.when){
                throw new Error('Please provide a valid moment schedule: ' + JSON.stringify(schedule));
            }

            scheduleProcess = self._subscribeMoment(schedule, cb);

            scheduleProcess._renewTimer = function(){
                var tmp = self._subscribeMoment(schedule, cb);
                return tmp.getTimerObject();
            };
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
            //timerObject = { from: timers[0], to: timers[1], _idleTimeout: timers[0]._idleTimeout };
        }

        else if(schedule.method === "now"){
            // next tick
            setImmediate(function(){
               cb();
            });
        }

        return scheduleProcess;
    }

    /**
     *
     * @param {ScheduleProcess} scheduleProcess
     * @returns {*}
     */
    unSubscribe(scheduleProcess){
        scheduleProcess.cancel();
    }

    /**
     *
     * @param currentDay
     * @param restrictDays
     * @returns {*}
     * @private
     */
    _getNextDay(currentDay, restrictDays){

        // asc
        restrictDays.sort();

        // Get position of current Day in array of days
        var pos = restrictDays.indexOf(currentDay);

        // Not in the list of days
        // We just return the next day
        if(pos < 0){

            // Try to get the first lower day
            // Otherwise just return the next first day (for example monday) + one week
            //var dayToReturn = null;
            //_.forEach(restrictDays, function(day){
            //    console.log(day, currentDay);
            //    if(day <= 7 && day > currentDay){
            //        dayToReturn = day;
            //        return;
            //    }
            //});

            // Return the first next day
            var indexPfDayToReturn = _.findIndex(restrictDays, function(day){
                return (day <= 7 && day > currentDay);
            });
            //if(dayToReturn !== null){
            if(indexPfDayToReturn !== -1){
                return restrictDays[indexPfDayToReturn];
            }

            // If we do not find anything just take the first restricted day and add 1 week
            return restrictDays[0] + 7;
        }

        if(pos == restrictDays.length - 1){
            return currentDay;
        }

        //if(pos < restrictDays.length - 1){
        //    return restrictDays[pos + 1];
        //}

        return currentDay;
    }

    /**
     *
     * @param when
     * @param format string|null may be null in case of using default moment format (ISO_8601)
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

        console.log('check next tick from %s to %s. Result %s s / %s m / %s h / %s d', now.format(), to.format(), waitFor / 1000, waitFor / 1000 / 60, waitFor / 1000 / 60 / 60, waitFor / 1000 / 60 / 60 / 24);

        // 32 Bits limit
        if(waitFor > config.x32Bit_NUMBER_LIMIT){
            console.log('waitFor is too huge number (over than 32 bit supported)', waitFor);
            var err = new Error('getNextMomentTick Maximum of 32 bits number reached');
            err.code = "MAXIMUM_x32";
            throw err;
        }

        // For some format. Once we arrive in past we need to set the next day/month/year because
        // the moment have to be repeated because 19:00 is an hour for every day.
        // Using option noRepeat allow us to retrieve negative tick (for example to know if the tick is passed)
        if(options.repeat !== false && waitFor < 0){

            console.log('Scheduled moment is negative. Trying to determine new date based on format [%s]', format);

            // If only minutes are set, we should check for next hours
            if([config.formats.minutes].indexOf(format) !== -1){
                to.add(1, 'hours');
                waitFor = this.getNextMomentTick(to, format);
            }

            // If we only specify hours. We should repeat this moment for tomorrow too
            if([config.formats.hours, config.formats.hoursMinutes,].indexOf(format) !== -1){
                to.add(1, 'days');
                waitFor = this.getNextMomentTick(to, format);
            }

            console.log([config.formats.day, config.formats.dayHours, config.formats.dayHoursMinutes], format );
            if([config.formats.day, config.formats.dayHours, config.formats.dayHoursMinutes].indexOf(format) !== -1){
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
            var currentDay = to.weekday();
            var daySelector = this._getNextDay(currentDay, restrictDays);

            // Set the "to date" with the current next day to get next tick
            // in case of the to day is now different
            to.day(daySelector);
            if(daySelector !== currentDay){
                waitFor = this.getNextMomentTick(to, format);
            }
        }

        return waitFor;
    }

    /**
     *
     * @param interval
     * @param cb
     * @returns {number|Object}
     * @private
     */
    _subscribeInterval(schedule, cb){
        console.log("Requested schedule: interval of %s.", schedule.interval);

        var scheduleProcess = new ScheduleProcess(this, 'interval', schedule, null);
        var interval = schedule.interval;

        if(interval > config.x32Bit_NUMBER_LIMIT){
            throw new Error('Interval value too high. 32bits number limit is ' + config.x32Bit_NUMBER_LIMIT + '. You are using ' + interval);
        }

        if(interval < 0){
            throw new Error('Please provide positive number for interval');
        }

        var timer = setInterval(function(){
            return cb();
        }, interval);
        scheduleProcess.setTimerObject(timer);
        return scheduleProcess;
    }

    /**
     *
     * @param {Array|string} when
     * "12:00" | ["12:00", "HH:mm", ...]
     * @param cb
     * @returns ScheduleProcess timer object
     * @private
     */
    _subscribeMoment(schedule, cb){
        var self = this;
        var momentDate = null;
        // By default, use null which result by using moment ISO_8601 format
        var format = null;
        var days = null;
        var restrictedDays = [];
        var when = schedule.when;

        // We have to use schedule process because timer are dynamically created here.
        // In order to keep reference to these timer we need an object as container.
        var scheduleProcess = new ScheduleProcess(this, 'moment', schedule, null);

        // Extract date + format + specific days from schedule.when object
        //if(!Array.isArray(when)){

            // Case we have a date.
            if (when instanceof Date){
                momentDate = when.toISOString(); // convert to ISO_8601 extended format
            }
            //else{
            //    momentDate = when;
            //}
        //}
        else{
            momentDate = when[0];
            if(when.length > 1){
                format = when[1];
            }
            if(schedule.days && Array.isArray(schedule.days)){
                restrictedDays = schedule.days;
            }
        }

        console.log("Requested schedule: moment for [moment:%s] [format:%s] [days:%s].", momentDate, format, restrictedDays.join(','));

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
                console.log('Using temporized timeout while next tick is over MAXIMUM_x32. use [%s]', waitFor, config.x32Bit_NUMBER_LIMIT);
                var timer = setTimeout(function() {
                    console.log('timeout temporized');
                    loop();
                }, config.x32Bit_NUMBER_LIMIT);
                scheduleProcess.setTimerObject(timer);
            }
            else{
                if(waitFor < 0){
                    console.log("Schedule moment is related to past. No schedule planned!");
                }
                else{
                    console.log("Schedule moment will be call in %s seconds / %s minutes / %s h / %s d.", (waitFor / 1000).toFixed(2), (waitFor / 1000 / 60).toFixed(2), (waitFor / 1000 / 60 / 60).toFixed(2), (waitFor / 1000 / 60 / 60 / 24).toFixed(2));
                    var timer = setTimeout(function() {
                        cb();
                        // false ensure we will not loop on the same date until the next (day, hours, ...) pass.
                        loop(false);
                    }, waitFor);
                    scheduleProcess.setTimerObject(timer);
                }
            }
        }(true));
        return scheduleProcess;
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
        scheduleDaemons.push(this._subscribeMoment({
            when: [from, format]
        }, function(){
            return cb();
        }));

        // Get left moment
        scheduleDaemons.push(this._subscribeMoment({
            when: [to, format]
        }, function(){
            return cb2();
        }));

        return scheduleDaemons;
    }
}

module.exports = Scheduler;
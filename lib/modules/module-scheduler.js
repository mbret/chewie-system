'use strict';

var _ = require('lodash');
var moment = require('moment');
var logger = LOGGER.getLogger('Scheduler');
var Scheduler = require(LIB_DIR + '/scheduler.js');

var schedulers = [];

class ModuleScheduler extends Scheduler{

    constructor(daemon, moduleName, moduleType){
        super(daemon);
        this.moduleName = moduleName;
        this.moduleType = moduleType;
        schedulers.push(this);
    }

    static getSchedulers(type){
        if(type){
            return _.filter(schedulers, function(schedule){
               return schedule.moduleType === type;
            });
        }
        return schedulers;
    }

    /**
     * Subscribe a new schedule for a module and use or create its scheduler.
     * @param daemon
     * @param moduleName
     * @param moduleType
     * @param schedule
     * @param cb
     * @param cb2
     * @returns {*|ScheduleProcess[]|ScheduleProcess}
     */
    static subscribe(daemon, moduleName, moduleType, schedule, cb, cb2){
        var index = _.findIndex(schedulers, function(scheduler){
           return scheduler.moduleName === moduleName;
        });
        if(index === -1){
            var scheduler = new ModuleScheduler(daemon, moduleName, moduleType);
        }
        else{
            var scheduler = schedulers[index];
        }
        return scheduler.subscribe(schedule, cb, cb2);
    }
}

module.exports = ModuleScheduler;
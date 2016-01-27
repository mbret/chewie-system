'use strict';

var _ = require('lodash');
var Scheduler = require(LIB_DIR + '/scheduler.js');
var ModuleScheduler = require(LIB_DIR + '/modules/module-scheduler.js');

module.exports = function(server, router){

    var self = server;

    /**
     * Helper to check state of daemon
     */
    router.get('/ping', function (req, res) {
        res.send('pong');
    });

    /**
     * Expose route to shutdown daemon.
     */
    router.get('/shutdown', function(req, res){
        res.sendStatus(200);
        self.daemon.shutdown();
    });

    router.get('/restart', function(req, res){
        setTimeout(function(){ self.daemon.restart() }, 1);
        return res.sendStatus(200);
    });

    router.get('/system', function(req, res){

        return res.status(200).send({
            startedAt: buddy.info.startedAt
        });
    });
    /**
     *
     */
    //router.get('/schedules', function(req, res){
    //
    //    var schedulers = ModuleScheduler.getSchedulers('user');
    //
    //    var schedules = {
    //        userModules: [],
    //        coreModules: []
    //    };
    //
    //    /**
    //     * For each scheduler return the name of module + the schedules
    //     */
    //    _.forEach(schedulers, function(scheduler){
    //        var object = {
    //            moduleName: scheduler.moduleName,
    //            schedules: _.map(scheduler.getSchedules(), function(schedule){
    //                return {
    //                    method: schedule.method,
    //                    when: schedule.when,
    //                    interval: schedule.interval,
    //                    processId: schedule.timerObject ? schedule.timerObject._idleTimeout : null
    //                }
    //            })
    //        };
    //        if(scheduler.moduleType === 'core'){
    //            schedules.coreModules.push(object);
    //        }
    //        else{
    //            schedules.userModules.push(object);
    //        }
    //    });
    //    return res.send(schedules);
    //});

    return router;
};
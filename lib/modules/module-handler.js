'use strict';

var _ = require('lodash');
var Tasks           = require(LIB_DIR + '/modules/task.js');
var Task            = Tasks.Task;
var DirectTask      = Tasks.DirectTask;
var CommandedTask   = Tasks.CommandedTask;
var ScheduledTask   = Tasks.ScheduledTask;
var async = require('async');
var logger = LOGGER.getLogger('ModuleHandler');

class ModuleHandler{

    constructor(){

    }

    /**
     * Completely delete a module task.
     * @param task
     */
    static deleteTask(task){

        // clean task from runtime
        if(task instanceof ScheduledTask){
            // unSubscribe the schedule
            MyBuddy.scheduler.unSubscribe(task.scheduleProcess);
        }

        _.remove(MyBuddy.tasks.userModules, function(tmp){
            return tmp.id === task.id
        });

        // clean task from db
        // @todo
    }

    static initializeModules(modules, done){

        async.forEachOf(modules, function(module, id, cb){
            logger.debug('Initialize module [%s]', module.id);
            var initialized = false;

            module.instance.initialize(function(err){
                initialized = true;
                return cb(err);
            });

            setTimeout(function(){
                if(!initialized){
                    logger.warn('The module [%s] seems to take abnormal long time to start!', module.id);
                }
            }, 1500);
        }, function(err){
            return done(err);
        });
    };
}

module.exports = ModuleHandler;
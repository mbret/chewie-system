'use strict';

var _ = require('lodash');
var Tasks           = require(LIB_DIR + '/modules/task.js');
var Task            = Tasks.Task;
var DirectTask      = Tasks.DirectTask;
var CommandedTask   = Tasks.CommandedTask;
var ScheduledTask   = Tasks.ScheduledTask;

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
}

module.exports = ModuleHandler;
'use strict';

var _           = require('lodash');
var config      = require('../config.js');
var fs = require('fs');

class Module{

    constructor(helper){
        this.helper = helper;
    }

    initialize(cb)
    {
        var self = this;

        // A new task has been registered with this module
        this.helper.onNewTaskToTrigger(function(task, cb){

            // register command and listen for execution
            MyBuddy.speechHandler.registerNewCommand(task.triggerOptions.command, function onExecuted(){

                // Execute task
                return cb();
            });
        });

        return cb();
    }

    getConfig(){
        return config.taskTriggerVoice;
    }
}

module.exports = Module;
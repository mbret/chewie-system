'use strict';

var _           = require('lodash');
var config      = require('../config.js');
var fs = require('fs');

class Module{

    /**
     *
     * @param helper
     */
    constructor(helper){
        this.helper = helper;
    }

    initialize(cb)
    {
        var self = this;

        // new task registered with this command plugin
        this.helper.onNewTaskToTrigger(function(task, cb){

            console.log(task.triggerOptions, task.options);

            // register command and listen for execution
            MyBuddy.speechHandler.registerNewCommand(task.triggerOptions.command, function onExecuted(){

                // Execute task
                return cb();
            });
        });

        return cb();
    }

    getConfig(){
        return {

        };
    }
}

module.exports = Module;
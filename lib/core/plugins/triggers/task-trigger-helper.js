'use strict';

var AbstractHelper = require('../plugins/abstract-helper.js');
var _ = require('lodash');

class TaskTriggerHelper extends AbstractHelper{

    /**
     *
     * @param daemon
     * @param module
     */
    constructor(daemon, module){
        super(daemon, module);
        this.daemon = daemon;
        this.module = module;
        this.logger = MyBuddy.logger.Logger.getLogger('Module [' + this.module.id + ']');
    }

    /**
     * Listen for new task to be triggered.
     * Use a callback to do your job and watch user trigger.
     * @param cb
     */
    onNewWatch(cb){
        var self = this;

        this.module.on('trigger:watch', function(id, options){

            // return the task to the trigger and a callback to execute task
            // The trigger only care about "when to trigger task". This method handle the task execution.
            return cb(options, function(){

                self.module.emit('trigger:execute:' + id);
            });
        });
    }

}

module.exports = TaskTriggerHelper;
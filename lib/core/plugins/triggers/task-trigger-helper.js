'use strict';

var AbstractHelper = require(CORE_DIR + '/plugins/abstract-helper.js');
var logger = LOGGER.getLogger('TaskTriggerHelper');
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
        this.logger = LOGGER.getLogger('Module [' + this.module.id + ']');
    }

    /**
     * Listen for new task to be triggered.
     * Use a callback to do your job and watch user trigger.
     * @param cb
     */
    onNewWatch(cb){
        var self = this;

        this.module.on('watch', function(id, options){

            // return the task to the trigger and a callback to execute task
            // The trigger only care about "when to trigger task". This method handle the task execution.
            return cb(options, function(){

                self.module.emit('execute', id);
            });
        });
    }

}

module.exports = TaskTriggerHelper;
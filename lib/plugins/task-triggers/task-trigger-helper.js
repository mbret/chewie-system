'use strict';

var AbstractHelper = require(LIB_DIR + '/plugins/abstract-helper.js');
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
    onNewTaskToTrigger(cb){
        var event = this.module.pluginId + ':' + this.module.id + ':trigger:new';
        logger.debug('[%s] add a listener for event -> [%s]', this.module.id, event);

        MyBuddy.on(event, function(task){

            // return the task to the trigger and a callback to execute task
            // The trigger only care about "when to trigger task". This method handle the task execution.
            return cb(task, function(){
                MyBuddy.moduleHandler._executeUserTask(task);
            });
        });
    }
}

module.exports = TaskTriggerHelper;
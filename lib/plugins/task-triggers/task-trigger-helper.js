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
     *
     * @param cb
     */
    onNewTaskToTrigger(cb){
        var event = this.module.pluginId + ':' + this.module.id + ':trigger:new';
        logger.debug('[%s] add a listener for event -> [%s]', this.module.id, event);

        MyBuddy.on(event, function(task){
            return cb(task, function(){
                MyBuddy.moduleHandler._executeUserTask(task);
            });
        });
    }

    /**
     * Execute message for the specified task
     * @param task
     * @param message
     */
    executeMessage(task, message){
        var self = this;
        logger.debug('execute message for adapters [' + task.messageAdapters + ']');

        MyBuddy.messageAdaptersHandler.executeMessage(task, message);
    }
}

module.exports = TaskTriggerHelper;
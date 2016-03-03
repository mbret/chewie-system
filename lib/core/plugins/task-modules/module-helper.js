'use strict';

var AbstractHelper = require(CORE_DIR + '/plugins/abstract-helper.js');
var logger = LOGGER.getLogger('ModuleHelper');
var _ = require('lodash');

class ModuleHelper extends AbstractHelper{

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

    onNewTask(cb){
        logger.debug('Module [%s] is now listening to new task being executed', this.module.getId());
        MyBuddy.on('task:execute:' + this.module.getId(), function(task, contextOptions){
            cb(task, contextOptions);
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

module.exports = ModuleHelper;
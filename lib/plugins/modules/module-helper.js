'use strict';

var AbstractHelper = require(LIB_DIR + '/plugins/abstract-helper.js');
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
        logger.log('listen for ' + this.module.id + ':task:new');
        MyBuddy.on(this.module.id + ':task:new', function(task){
            cb(task);
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
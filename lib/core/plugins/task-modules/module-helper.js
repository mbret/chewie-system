'use strict';

var AbstractHelper = require(CORE_DIR + '/plugins/abstract-helper.js');
var logger = LOGGER.getLogger('ModuleHelper');
var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events');

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
        var self = this;
        logger.debug('Module [%s] is now listening to new task being registered', this.module.getId());

        this.daemon.on('task:registered:' + this.module.getId(), function(task){
            cb(task);
        });
    }

    onTaskStopped(cb){
        this.daemon.on('task:stopped:' + this.module.getId(), function(trigger){
            cb(trigger);
        });
    }

    /**
     * Execute message for the specified task
     * @param task
     * @param message
     */
    executeMessage(context, message){
        logger.debug('execute message for adapters [' + context.messageAdapters + ']');
        this.daemon.messageAdaptersHandler.executeMessage(context.messageAdapters, message);
    }
}

module.exports = ModuleHelper;
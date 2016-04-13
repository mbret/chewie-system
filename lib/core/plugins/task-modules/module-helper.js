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
        logger.debug('Module [%s] is now listening to new task being executed', this.module.getId());

        // Listen for new task being executed on this module
        this.daemon.on('task:execute:' + this.module.getId(), function(trigger){

            function Context(trigger){
                this.id = trigger.getId(),
                this.task = trigger.getTask(),
                this.options = trigger.getOptions();
                this.messageAdapters = trigger.getMessageAdapters()
            }

            util.inherits(Context, EventEmitter);

            var context = new Context(trigger);

            cb(context);
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
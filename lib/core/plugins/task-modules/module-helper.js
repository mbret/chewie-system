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
        this.daemon.on('task:execute:' + this.module.getId(), function(trigger){
            cb({
                id: trigger.getId(),
                task: {
                    options: trigger.getTask().getOptions()
                },
                options: trigger.getOptions(),
                messageAdapters: trigger.getMessageAdapters()
            });
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
'use strict';

var AbstractHelper = require(CORE_DIR + '/plugins/abstract-helper.js');
var logger = LOGGER.getLogger('ModuleHelper');
var _ = require('lodash');
var util = require('util');

class ModuleHelper extends AbstractHelper{

    /**
     *
     * @param daemon
     * @param module
     */
    constructor(daemon, module){
        super(daemon, module);

        var self = this;
        this.daemon = daemon;
        this.module = module;
        this.logger = LOGGER.getLogger('Module [' + this.module.id + ']');

        this.daemon.on('task:registered:' + this.module.getId(), function(task){
            self.emit('new:task', task);
        });
    }

    /**
     * Execute message for the specified task
     */
    executeMessage(taskTrigger, message){
        logger.debug('execute message for adapters [' + taskTrigger.getOutputAdapters() + ']');
        this.daemon.outputAdaptersHandler.executeMessage(taskTrigger.getOutputAdapters(), message);
    }
}

module.exports = ModuleHelper;
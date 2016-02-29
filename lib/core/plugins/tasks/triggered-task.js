'use strict';

var Task = require('./task.js');
var _ = require('lodash');

class TriggeredTask extends Task{

    /**
     *
     * @param id
     * @param module
     * @param messageAdapters
     * @param options
     * @param trigger
     * @param triggerOptions
     */
    constructor(id, module, pluginId, messageAdapters, options, trigger, triggerOptions){
        super(id, module, pluginId, messageAdapters, options);

        if(!_.isPlainObject(trigger) || !_.has(trigger, 'id') || !_.has(trigger, 'pluginId')){
            var err = new Error('Invalid trigger [' + this.module + ']: ' + JSON.stringify(trigger));
            err.code = Task.ERROR_CODE.INVALID;
            throw err;
        }

        if(!_.isPlainObject(triggerOptions)){
            var err = new Error('Invalid trigger options [' + this.module + ']: ' + JSON.stringify(triggerOptions));
            err.code = Task.ERROR_CODE.INVALID;
            throw err;
        }

        this.trigger = trigger;
        this.triggerOptions = triggerOptions;
    }

    /**
     *
     */
    toDb(){
        return _.merge(super.toDb(), {
            trigger : this.trigger,
            triggerOptions : this.triggerOptions
        });
    }
}

module.exports = TriggeredTask;
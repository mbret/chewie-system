'use strict';

var _       = require('lodash');
var config  = require('./config.js');
var EventEmitter = require('events').EventEmitter;

/**
 *
 * @param daemon
 * @param scheduler
 * @param logger
 */
class Module extends EventEmitter{

    /**
     *
     * @param daemon
     * @param userConfig
     * @param scheduler
     */
    constructor(helper){
        super();
        this.helper = helper;
    }

    /**
     * Start method. Mandatory !
     */
    initialize(cb){
        var self = this;

        // Listen for new task on module
        this.helper.onNewTask(function(task){
            self.say(task);
        });

        return cb();
    }

    /**
     *
     * @returns {object}
     */
    getConfig(){
        return {
            options: [
                {
                    name: 'text',
                    label: 'Texte',
                    type: 'text',
                    required: true,
                }
            ]
        };
    }

    /**
     * This module is simple and only say a message.
     * @param task
     * @private
     */
    say(task){
        var self = this;
        if(!_.isString(task.options.text)){
            logger.warn('Invalid task received [options=%s]', task.options);
        }
        else{
            var text = task.options.text;
            // handle what user want (mail, voice, etc)
            this.helper.executeMessage(task, text);
        }

        // possible gpio action
        this.helper.executeGpio(task, null);
    }

}

module.exports = Module;
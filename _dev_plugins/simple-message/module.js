'use strict';

var _       = require('lodash');
var config  = require('./config.js').module;
var EventEmitter = require('events').EventEmitter;

/**
 *
 * @param daemon
 * @param scheduler
 * @param logger
 */
class Module extends EventEmitter{

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
        this.helper.onNewTask(function(context){
            console.log(context);
            self.say(context);
        });

        return cb();
    }

    /**
     *
     * @returns {object}
     */
    getConfig(){
        return config;
    }

    /**
     * This module is simple and only say a message.
     * @param task
     * @private
     */
    say(context){
        var self = this;
        if(!_.isString(context.options.text)){
            self.helper.notify('warn', 'Invalid task options received [' + JSON.stringify(context.options) + ']');
        }
        else{
            var text = context.options.text;
            // handle what user want (mail, voice, etc)
            this.helper.executeMessage(context, text);
        }
    }

}

module.exports = Module;
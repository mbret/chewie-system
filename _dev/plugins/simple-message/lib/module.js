'use strict';

var _ = require('lodash');

class Module {

    constructor(helper){
        this.helper = helper;
    }

    /**
     * Start method. Mandatory !
     */
    initialize(cb){
        var self = this;

        // Listen for new task on module
        this.helper.onNewTask(function(context){
            self.say(context);
        });

        return cb();
    }

    /**
     *
     * @returns {object}
     */
    getConfig(){
        return {};
    }

    /**
     * This module is simple and only say a message.
     */
    say(context){
        var self = this;
        if(!_.isString(context.options['taskOptions.option1'])){
            self.helper.notify('warn', 'Invalid task options received [' + JSON.stringify(context.options) + ']');
        }
        else{
            var text = context.options['taskOptions.option1'];
            // handle what user want (mail, voice, etc)
            this.helper.executeMessage(context, text);
        }
    }

}

module.exports = Module;
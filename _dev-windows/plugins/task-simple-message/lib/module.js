'use strict';

var _ = require('lodash');

class Module {

    constructor(helper){
        this.helper = helper;
    }

    initialize(cb){
        var self = this;

        // Listen for new task on module
        this.helper.on('new:task', function(task){

            task.on('execute', function(trigger){
                self.say(trigger);
            });

            task.on('stopped', function(){

            });
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
        if(!_.isString(context.getOptions().text)){
            self.helper.notify('warn', 'Invalid task options received [' + JSON.stringify(context.options) + ']');
        }
        else{
            var text = context.getOptions().text;
            // handle what user want (mail, voice, etc)
            this.helper.executeMessage(context, text);
        }
    }

}

module.exports = Module;
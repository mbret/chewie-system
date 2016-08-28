'use strict';

var _ = require('lodash');

class Module {

    constructor(helper){
        this.helper = helper;
    }

    initialize(cb){
        return cb();
    }

    destroy(cb) {
        return cb();
    }

    newTask(task) {
        task.on('execute', function(context){
            self._say(context);
        });

        task.on('stopped', function(){

        });
    }

    /**
     * This module is simple and only say a message.
     */
    _say(context){
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
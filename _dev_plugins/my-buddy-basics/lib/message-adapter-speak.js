'use strict';

var _ = require('lodash');

/**
 * Simple message adapter that allow using speaker.
 */
class Module{

    constructor(helper) {
        this.helper = helper;
    }

    getConfig(){
        return {
            displayName: 'Speak'
        };
    }

    initialize(cb)
    {
        var self = this;

        this.helper.onNewMessage(function(message){
            self.helper.getSpeaker().play(message);
        });

        return cb();
    }
}

module.exports = Module;
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
        return cb();
    }

    execute(message){
        var self = this;
        self.helper.getSpeaker().play(message);
    }
}

module.exports = Module;
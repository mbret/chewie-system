'use strict';

/**
 * Simple message adapter that allow using console.
 */
class MessageAdapterConsole{

    constructor(helper){
        this.helper = helper;
    }

    initialize(cb)
    {
        var self = this;

        return cb();
    }

    executeMessage(message){
        this.helper.getLogger().info(message);
    }
}

module.exports = MessageAdapterConsole;
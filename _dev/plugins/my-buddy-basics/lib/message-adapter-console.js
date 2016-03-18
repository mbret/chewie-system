'use strict';

/**
 * Simple message adapter that allow using console.
 */
class MessageAdapterConsole{

    constructor(helper){
        this.helper = helper;
    }

    getConfig(){
        return {
            displayName: 'Console'
        }
    }

    initialize(cb)
    {
        var self = this;

        this.helper.onNewMessage(function(message){
            self.helper.getLogger().info(message);
        });

        return cb();
    }
}

module.exports = MessageAdapterConsole;
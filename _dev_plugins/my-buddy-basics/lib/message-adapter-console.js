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
        return cb();
    }

    execute(message){
        this.helper.getLogger().info(message);
    }
}

module.exports = MessageAdapterConsole;
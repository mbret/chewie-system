'use strict';

var logger = LOGGER.getLogger('AbstractHelper');
var _ = require('lodash');

/**
 * Module helper.
 */
class AbstractHelper{

    constructor(daemon, module){
        this.daemon = daemon;
        this.module = module;
        this.container = this.module;
    }

    getSystem(){
        return MyBuddy;
    }

    notify(type, message){
        //message = 'The module ' + this.module.getId() + ' from plugin ' + this.module.getPluginId() + ' says: ' + message;
        this.module.notify(type, message);
    }

    executeGpio(){
        this.daemon.executeGpio();
    }

    getLogger(){
        return this.logger;
    }

    getSpeaker(){
        return MyBuddy.speaker;
    }

    /**
     * Listen for user config update.
     * @param cb
     */
    onUserOptionsChange(cb){
        this.container.on('userOptions:update', function(options){
            cb(options)
        });
    }

    getUserOptions(){
        return this.container.getUserOptions();
    }
}

module.exports = AbstractHelper;
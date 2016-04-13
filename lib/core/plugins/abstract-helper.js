'use strict';

var logger = LOGGER.getLogger('AbstractHelper');
var _ = require('lodash');
var taskQueue = require('my-buddy-lib').taskQueue;

/**
 * Module helper.
 */
class AbstractHelper{

    constructor(daemon, module){
        this.daemon = daemon;
        this.module = module;
        this.container = this.module;

        this.speaker = {
            playFile: this.daemon.speaker.playFile.bind(this.daemon.speaker)
        };

        this.taskQueue = taskQueue;
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
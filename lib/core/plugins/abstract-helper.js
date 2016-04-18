'use strict';

var logger = LOGGER.getLogger('AbstractHelper');
var _ = require('lodash');
var taskQueue = require('my-buddy-lib').taskQueue;
var EventEmitter = require('events');

/**
 * Module helper.
 */
class AbstractHelper extends EventEmitter {

    constructor(daemon, module){
        super();

        this.daemon = daemon;
        this.module = module;

        this.speaker = {
            playFile: this.daemon.speaker.playFile.bind(this.daemon.speaker)
        };

        this.taskQueue = taskQueue;
    }

    getPluginOptions(){
        return this.module.plugin.getPluginOptions();
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
        this.module.on('userOptions:update', function(options){
            cb(options)
        });
    }

    getOptions(){
        return this.module.getOptions();
    }
}

module.exports = AbstractHelper;
'use strict';

var _ = require('lodash');
var taskQueue = require('my-buddy-lib').taskQueue;
var EventEmitter = require('events');

/**
 * Module helper.
 */
class AbstractHelper extends EventEmitter {

    constructor(daemon, module){
        super();

        this.logger = daemon.logger.Logger.getLogger('AbstractHelper');

        this.daemon = daemon;
        this.module = module;

        this.speaker = this.daemon.speaker;

        this.taskQueue = taskQueue;
        //this.pluginTmpDir =
    }

    getPluginOptions(){
        return this.module.plugin.getOptions();
    }

    getPluginDataDir(){
        return this.module.plugin.dataDir;
    }

    getPluginTmpDir(){
        return this.module.plugin.tmpDir;
    }

    //getSystem(){
    //    return MyBuddy;
    //}

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
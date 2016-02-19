'use strict';

var EventEmitter = require('events').EventEmitter;
var logger = LOGGER.getLogger('Plugin Abstract Container');
var _ = require('lodash');
var chalk   = require('chalk');

class AbstractContainer extends EventEmitter{

    constructor(daemon, pluginId, userOptions, instance, id){
        super();

        if(pluginId === undefined || pluginId === null){
            throw new Error('parameter pluginId invalid');
        }

        if(userOptions === undefined || userOptions === null){
            throw new Error('parameter userOptions invalid');
        }

        if(instance === undefined){
            throw new Error('parameter instance invalid');
        }

        this.daemon = daemon;
        this.instance = instance;
        this.pluginId = pluginId;
        this.id = id;

        // User config is dynamic and is stored to db
        this.userOptions = userOptions;
    }

    setInstance(instance){
        this.instance = instance;
    }

    getUserOptions(){
        return this.userOptions;
    }

    getPluginId(){
        return this.pluginId;
    }

    getId(){
        return this.id;
    }

    /**
     * Set the user config options.
     * @param options
     */
    //setUserConfig(options){
    //    this.userConfig = _.merge(this.userConfig, options);
    //    this.save();
    //    this.emit('userOptions:update', this.userConfig);
    //}

    /**
     * Notify the entire system.
     *
     * Use the daemon event bus to attach a notification.
     * Module are free to listen on this event.
     *
     * @param type
     * @param message
     */
    notify(type, message){
        var color = function(text){ return text; }
        switch(type){
            case 'error':
                color = chalk.red.inverse;
                break;
        }
        logger.verbose('%s:%s:notify:%s: -> %s', this.getPluginId(), this.getId(), type, color(message));
        var notif = {type: type, message: message};

        // save notif to db
        MyBuddy.database.saveNotif(notif);

        // dispatch notification
        this.daemon.emit('notification:new', notif);
    }

    toJSON(){
        return {
            pluginId: this.getPluginId(),
            name: this.getId(),
            id: this.getId(),
            config: this.getConfig(),
            userOptions: this.getUserOptions()
        };
    }

    setUserOptions(options){
        this.userOptions = options;
        this.emit('userOptions:update', this.userOptions);
    }

    /**
     *
     * @param options
     * @param cb
     */
    setAndSaveUserOptions(options, cb){
        this.setUserOptions(options);
        this.saveUserOptions(options, function(err){
            return cb(err);
        });
    }

    saveUserOptions(){
        throw new Error('Must be implemented');
    }

    /**
     * Return the instance config.
     * Also make sure config contain required fields.
     */
    getConfig(){
        return _.merge({
            options: []
        }, this.instance.getConfig());
    }
}

module.exports = AbstractContainer;
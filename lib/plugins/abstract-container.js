'use strict';

var EventEmitter = require('events').EventEmitter;
var logger = LOGGER.getLogger('Plugin Abstract Wrapper');
var _ = require('lodash');

class AbstractContainer extends EventEmitter{

    constructor(daemon, pluginId, userOptions, instance){
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
        logger.verbose(this.constructor.name + ':notify:' + type + ':' + message);
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

    getConfig(){
        throw new Error('Must be implemented');
    }

    getConfig(){
        return _.merge({
            options: []
        }, this.instance.getConfig());
    }

    getId(){
        throw new Error('Must be implemented');
    }
}

module.exports = AbstractContainer;
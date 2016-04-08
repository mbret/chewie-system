'use strict';

var CustomEventEmitter = require(CORE_DIR + '/custom-event-emitter');
var logger = LOGGER.getLogger('Plugin Abstract Container');
var _ = require('lodash');
var chalk   = require('chalk');

class AbstractContainer extends CustomEventEmitter{

    constructor(daemon, pluginId, userOptions, instance, moduleId){
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
        this.moduleName = moduleId;
        this.id = this._generateId();

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

    notify(type, message){
        this.daemon.notificationService.push(type, message)
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
            // general module options
            // these options are typically configurable on the module page
            options: []
        }, this.instance.getConfig());
    }

    _generateId(){
        return this.pluginId + ':' + this.moduleName;
    }
}

module.exports = AbstractContainer;
'use strict';

var CustomEventEmitter = require(CORE_DIR + '/custom-event-emitter');
var _ = require('lodash');

/**
 * Module abstract container.
 * This container keep a reference to the running module object.
 */
class AbstractContainer extends CustomEventEmitter{

    /**
     *
     * @param daemon
     * @param plugin container
     * @param options
     * @param instance
     * @param name
     * @param id
     */
    constructor(daemon, plugin, options, instance, name, id, moduleConfig){
        super();

        this.logger = daemon.logger.Logger.getLogger('Plugin Abstract Container');

        if(instance === undefined){
            throw new Error('parameter instance invalid');
        }

        this.daemon = daemon;
        this.instance = instance;
        this.pluginId = plugin.id;
        this.plugin = plugin;
        this.moduleConfig = moduleConfig;
        // this.moduleName = moduleId;
        this.name = name;
        this.id = id;
        // this.id = this._generateId();
        // this.packageConfig = this._getModulePackageConfig();
        // User config is dynamic and is stored to db
        this.options = options;
    }

    // _getModulePackageConfig() {
    //     var config = null;
    //     var self = this;
    //     this.plugin.pluginPackage.modules.forEach(function(modulePackageConfig) {
    //         if(modulePackageConfig.name === self.name) {
    //             config = modulePackageConfig;
    //         }
    //     });
    //     return config;
    // }

    // setInstance(instance){
    //     this.instance = instance;
    // }
    //
    // getPlugin(){
    //     return this.plugin;
    // }
    //
    // getOptions(){
    //     return this.options;
    // }
    //
    // getPluginId(){
    //     return this.pluginId;
    // }
    //
    // getId(){
    //     return this.id;
    // }

    notify(type, message){
        this.daemon.notificationService.push(type, message)
    }

    // toJSON(){
    //     return {
    //         pluginId: this.getPluginId(),
    //         name: this.getId(),
    //         id: this.getId(),
    //         config: this.getConfig(),
    //         userOptions: this.getUserOptions()
    //     };
    // }
}

module.exports = AbstractContainer;
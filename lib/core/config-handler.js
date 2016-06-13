'use strict';

var _ = require('lodash');
var utils = require('my-buddy-lib').utils;
var ip  = require('ip');
var path = require('path');

/**
 * ConfigHandler
 *
 * To retrieve the complete config use this.getConfig().
 * It merge the system config and the user config into one.
 */
class ConfigHandler {

    /**
     *
     * @param system
     * @param config
     */
    constructor(system, systemConfig){
        this.system = system;

        // contain the system config
        // This config is defined by some files inside the module
        // The user may also write his own config file and ovewrite data
        this.systemConfig = systemConfig;
        this.prepareSystemConfig();

        // This is the user config.
        // Every element in this exist in systemConfig
        // but this is the only config that may be overwrite through
        // the normal app way (GUI for example)
        this.userConfig = null;

        this.storageAdapter = null;
        this.systemConfig.realIp = ip.address();
    }

    initialize(cb){
        return cb();
    }

    prepareSystemConfig(){
        this.systemConfig.system.pluginsDataDir = this.systemConfig.system.pluginsDataDir || path.resolve(this.systemConfig.system.dataDir, 'plugins');
        this.systemConfig.system.synchronizedPluginsDir = this.systemConfig.system.synchronizedPluginsDir || path.resolve(this.systemConfig.system.dataDir, 'synchronized-plugins');
    }

    setStorageAdapter(storageAdapter){
        this.storageAdapter = storageAdapter;
    }

    getSystemConfig(){
        return this.systemConfig;
    }

    getUserConfig(){
        return this.userConfig;
    }

    getConfig(){
        return _.merge(this.getSystemConfig(), this.getUserConfig())
    }

    /**
     *
     * @param cb
     */
    saveUserConfig(cb){
        if(!cb) cb = function(){};

        this.storageAdapter.saveUserConfig(this.getUserConfig(), cb);
    }

    loadUserConfig(cb){
        var self = this;
        this.storageAdapter.loadUserConfig(function(err, data){
            if(err){
                return cb(err);
            }
            self.userConfig = data;
            return cb();
        });
    }
}

module.exports = ConfigHandler;
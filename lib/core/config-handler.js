'use strict';

var _ = require('lodash');
var utils = require(MODULES_DIR + '/utils');
var ip = require('ip');

/**
 *
 */
class ConfigHandler{

    /**
     * Load config.
     *
     * Priority:
     * - config.js
     * - local.js
     *
     * WARNING: Does not load config from storage for now. This
     * config will be merged once deamon is started.
     *
     * @param path
     * @param root
     */
    static loadConfig(rootPath){

        // Get lib config
        var config = require(rootPath + '/config.js');

        // Try to load local config
        var localConfig = {};
        try{
            localConfig = require(rootPath + '/config.local.js');
        }
        catch(e){
            if(e.code !== "MODULE_NOT_FOUND"){
                throw new Error('Unable to load local config');
            }
        }

        var tmp = _.merge(config, localConfig, {
            appPath: rootPath,
        });

        return tmp;
    }

    static feedConfig(config, cb){
        config.realIp = ip.address();
        return cb();
    }
}



/**
 * Save configuration to db.
 * @param config
 */
//ConfigHandler.prototype.saveConfig = function(config){
//
//};

module.exports = ConfigHandler;
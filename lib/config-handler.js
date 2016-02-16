'use strict';

var _ = require('lodash');
var utils = require(LIB_DIR + '/utils.js');

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
        utils.getCurrentIp(function (err, add) {
            if(err) return cb(err);
            config.realIp = add;
            return cb();
        });
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
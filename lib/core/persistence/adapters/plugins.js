'use strict';

var async   = require('async');
var logger  = LOGGER.getLogger('PluginsPersistence');
var BaseAdapter = require('../base-adapter');

class PluginsPersistence extends BaseAdapter{

    constructor(system, persistence){
        super(system, persistence, 'plugins');
    }

    /**
     *
     * @param pluginId
     * @param moduleId
     * @param moduleType
     * @param options
     * @param cb
     */
    getUserOptions(pluginId, moduleId, moduleType, cb){

        var query = {
            pluginId: pluginId,
            moduleId: moduleId,
            moduleType: moduleType,
        };

        this.persistence.get(this.db, query, function(err, row){
            if(err){
                return cb(err);
            }
            if(row && row.options){
                return cb(null, row.options);
            }
            return cb(null, null);
        });
    }

    /**
     *
     * @param pluginId
     * @param moduleName
     * @param moduleType
     * @param options
     */
    saveUserOptions(pluginId, moduleId, moduleType, options, cb){

        var data = {
            pluginId: pluginId,
            moduleId: moduleId,
            moduleType: moduleType,
            options: options,
        };

        var query = {
            pluginId: pluginId,
            moduleId: moduleId,
            moduleType: moduleType,
        };

        this.persistence.saveOrUpdate(this.db, data, query, cb);
    }
}

module.exports = PluginsPersistence;
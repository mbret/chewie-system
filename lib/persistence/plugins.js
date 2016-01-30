'use strict';

class PluginsPersistance{

    /**
     *
     * @param pluginId
     * @param moduleId
     * @param moduleType
     * @param options
     * @param cb
     */
    static getUserOptions(pluginId, moduleId, moduleType, cb){

        var query = {
            pluginId: pluginId,
            moduleId: moduleId,
            moduleType: moduleType,
        };

        MyBuddy.database.get(MyBuddy.database.pluginsUserOptionsDb, query, function(err, row){
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
    static saveUserOptions(pluginId, moduleId, moduleType, options, cb){

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

        MyBuddy.database.saveOrUpdate(MyBuddy.database.pluginsUserOptionsDb, data, query, cb);
    }
}

module.exports = PluginsPersistance;
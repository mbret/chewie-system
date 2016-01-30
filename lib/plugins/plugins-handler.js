'use strict';

var CoreModule = require(LIB_DIR + '/plugins/core-modules/core-module.js');
var CoreModuleHelper = require(LIB_DIR + '/plugins/core-modules/core-module-helper.js');
var PersistencePlugin = require(LIB_DIR + '/persistence/plugins.js');
var logger = LOGGER.getLogger('PluginsHandler');

class PluginsHandler{

    static registerCoreModule(pluginId, name, module, cb){

        // Check module validity first
        if(!CoreModule.isInstanceValid(module)){
            throw new Error('Unable to register core module [' + name + '] because it\'s not a valid module');
        }

        // Extract user options
        PersistencePlugin.getUserOptions(pluginId, name, 'core-module', function(err, options){
            if(err){
                return cb(err);
            }

            if(options === null){
                options = {};
            }

            // Create container
            var container = new CoreModule(pluginId, name, null, options);

            // Create helper and attach to container
            var helper = new CoreModuleHelper(MyBuddy, container);

            // Instantiate module and attach to container
            container.setInstance(new module(helper));

            // register global core module
            MyBuddy.coreModulesNew.push(container);

            logger.verbose('Core module [%s] registered', name);

            return cb();
        });
    }
}

module.exports = PluginsHandler;
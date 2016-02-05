'use strict';

var _ = require('lodash');
var logger = LOGGER.getLogger('Plugin Helper');
var sync = require('synchronize');
var AbstractHelper = require(LIB_DIR + '/plugins/abstract-helper.js');

/**
 * PluginHelper
 *
 * Helper injected in user plugin. This is the top lvl of helper.
 * PluginHelper allow to register module, messenger adapters, etc.
 *
 * Only one instance of plugin helper is injected by user plugin.
 */
class PluginHelper extends AbstractHelper{

    constructor(daemon, plugin){
        super(daemon, plugin);
        this.plugin = plugin;
    }

    /**
     * Update the config for this plugin
     * @param config
     */
    setConfig(config){
        this.plugin.config = config;
    }

    registerVoiceCommandAdapter(module){
        var helper = {
            newTextDetected: function(text){

            }
        };
        var wrapper = function(instance){
            this.instance = instance;
            this.instance.on('text:new', function(text){
                console.log(text);
            });
        };
        var instance = new module(helper);

        new wrapper(instance);
    }

    /**
     * Register a new module.
     *
     * @param {object} module
     * @param {string=} moduleName - Use the module name or specified one.
     */
    registerModule(moduleName, module){

        // module, config
        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // force synchronized
        sync.await(MyBuddy.pluginsHandler.registerModule(this.plugin.id, moduleName, module, sync.defer()));
    }

    /**
     * This method is synchronous for the plugin (easier to use)
     * but have asynchronous stuff. Read below:
     *
     * /!\  This method is called by the plugin synchronously so we use specific mecanism
     *      to wait for the plugin to be fully loaded.
     *
     * @param moduleName
     * @param module
     */
    registerMessageAdapter(moduleName, module){

        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // register global adapter
        sync.await(MyBuddy.pluginsHandler.registerMessageAdapter(this.plugin.id, moduleName, module, sync.defer()));
    }

    registerCoreModule(moduleName, module){

        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // force synchronized
        sync.await(MyBuddy.pluginsHandler.registerCoreModule(this.plugin.id, moduleName, module, sync.defer()));
    }

    registerTaskTrigger(moduleName, module){

        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // force synchronized
        sync.await(MyBuddy.pluginsHandler.registerTaskTrigger(this.plugin.id, moduleName, module, sync.defer()));
    }
}

module.exports.PluginHelper = PluginHelper;
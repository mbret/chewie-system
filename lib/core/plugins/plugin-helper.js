'use strict';

var _ = require('lodash');
var sync = require('synchronize');
var AbstractHelper = require(CORE_DIR + '/plugins/abstract-helper.js');
var validator = require('validator');

/**
 * PluginHelper
 *
 * Helper injected in user plugin. This is the top lvl of helper.
 * PluginHelper allow to register module, messenger adapters, etc.
 *
 * Only one instance of plugin helper is injected by user plugin.
 */
class PluginHelper extends AbstractHelper{

    constructor(system, plugin){
        super(system, plugin);

        this.logger = MyBuddy.logger.Logger.getLogger('Plugin Helper');

        this.plugin = plugin;
    }

    getPluginOptions(){
        return this.plugin.getPluginOptions();
    }

    getPluginDataDir(){
        return this.plugin.dataDir;
    }

    getPluginTmpDir(){
        return this.plugin.tmpDir;
    }

    /**
     * Update the config for this plugin
     * @param config
     */
    //setConfig(config){
    //    this.plugin.config = config;
    //}

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

        throw new Error("Use plugin-package.js");
        //moduleName = moduleName + ''; // cast string
        //
        //if(!validator.isLength(moduleName, {min: 1})){
        //    throw new Error('Invalid moduleName');
        //}
        //
        //// force synchronized
        //sync.await(this.daemon.pluginsHandler.registerModule(this.plugin, moduleName, module, sync.defer()));
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
    registerOutputAdapter(moduleName, module){

        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // register global adapter
        sync.await(MyBuddy.pluginsHandler.registerOutputAdapter(this.plugin, moduleName, module, sync.defer()));
    }

    registerCoreModule(moduleName, module){

        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // force synchronized
        sync.await(MyBuddy.pluginsHandler.registerCoreModule(this.plugin, moduleName, module, sync.defer()));
    }

    registerTrigger(moduleName, module){

        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // force synchronized
        sync.await(MyBuddy.pluginsHandler.registerTrigger(this.plugin, moduleName, module, sync.defer()));
    }
}

module.exports.PluginHelper = PluginHelper;
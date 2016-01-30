'use strict';

var _ = require('lodash');
var logger = LOGGER.getLogger('Plugin Helper');
var ModuleWrapper = require(LIB_DIR + '/plugin-wrappers/module-wrapper.js');
var sync = require('synchronize');
var AbstractHelper = require(LIB_DIR + '/plugins/abstract-helper.js');
var PluginsHandler = require(LIB_DIR + '/plugins/plugins-handler.js');

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
    registerModule(moduleName, module, config){

        // module, config
        if(!_.isString(moduleName)){
            config = module;
            module = moduleName;
            moduleName = this.plugin.name;
        }

        if(!ModuleHelper.checkModuleValidity(module, moduleName)){
            throw new Error('Unable to register module [' + moduleName + '] because it\'s not a valid module');
        }

        // System container
        var tmp = new ModuleWrapper(moduleName, null);

        // Module helper (deal with container)
        var helper = new ModuleHelper(MyBuddy, tmp);

        // Module instance
        tmp.instance = new module(helper);

        // register and attach module to daemon
        MyBuddy.userModules[moduleName] = tmp;

        logger.verbose('Plugin [%s] Registered new module [%s]', this.plugin.name, moduleName);
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

        var self = this;
        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // register global adapter
        sync.await(MyBuddy.messenger.registerMessageAdapter(moduleName, module, {}, sync.defer()));

        // keep reference for this plugin
        this.plugin.messageAdapters.push(moduleName);
    }

    registerCoreModule(moduleName, module){

        if(!_.isString(moduleName)){
            module = moduleName;
            moduleName = this.plugin.name;
        }

        // force synchronized
        sync.await(PluginsHandler.registerCoreModule(this.plugin.id, moduleName, module, sync.defer()));
    }
}

class ModuleHelper extends AbstractHelper{

    /**
     *
     * @param daemon
     * @param module
     */
    constructor(daemon, module){
        super(daemon, module);
        this.daemon = daemon;
        this.module = module;
        this.logger = LOGGER.getLogger('Module [' + this.module.id + ']');
    }

    onNewTask(cb){
        logger.log('listen for ' + this.module.id + ':task:new');
        MyBuddy.on(this.module.id + ':task:new', function(task){
            cb(task);
        });
    }

    notify(type, message){
        message = 'The module ' + this.module.id + ' says: ' + message;
        super.notify(type, message);
    }

    static checkModuleValidity(module, moduleName){
        if(typeof module !== 'function'){
            logger.error('The module [' + moduleName + '] is not a function');
            return false;
        }
        if(
            !(module.prototype.initialize instanceof Function)
            || !(module.prototype.getConfig instanceof Function)
        ){
            logger.error('The module [' + moduleName + '] does not have minimal required methods!');
            return false;
        }

        return true;
    }
}

module.exports.PluginHelper = PluginHelper;
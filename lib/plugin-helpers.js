'use strict';

var _ = require('lodash');
var logger = LOGGER.getLogger('Plugin Helper');
var ModuleWrapper = require(LIB_DIR + '/plugin-wrappers/module.js');

/**
 * Module helper.
 */
class AbstractHelper{

    constructor(daemon, module){
        this.daemon = daemon;
        this.module = module;
    }

    notify(type, message){
        this.module.notify(type, message);
    }

    /**
     * Execute message for the specified task
     * @param task
     * @param message
     */
    executeMessage(task, message){
        var self = this;
        logger.debug('execute message for adapters [' + task.messageAdapters + ']');

        _.forEach(task.messageAdapters, function(id){
            var adapter = buddy.messenger.getAdapter(id);

            if(adapter === null){
                self.notify('error', 'The message adapter ' + task.messageAdapters + ' does not seems to be loaded. Unable to execute message');
                return;
            }

            adapter.executeMessage(message);
        });
    }

    executeGpio(){
        this.daemon.executeGpio();
    }
}

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

        if(typeof module !== 'function'){
            throw new Error('Unable to register module [' + moduleName + '] because it\'s not a function');
        }
        if(!(module.prototype.initialize instanceof Function)){
            throw new Error('A module [' + moduleName + '] is trying to be register but does not seems to be valid!');
        }

        // System container
        var tmp = new ModuleWrapper(moduleName, null);

        // Module helper (deal with container)
        var helper = new ModuleHelper(buddy, tmp);

        // Module instance
        tmp.instance = new module(helper);

        // register and attach module to daemon
        buddy.userModules[moduleName] = tmp;

        logger.verbose('Plugin [%s] Registered new module [%s]', this.plugin.name, moduleName);
    }

    /**
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
        this.daemon.messenger.registerMessageAdapter(moduleName, module, {});

        // keep reference for this plugin
        this.plugin.messageAdapters.push(moduleName);

        logger.verbose('Plugin [%s] Registered new message adapter [%s]', this.plugin.name, moduleName);
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
    }

    onNewTask(cb){
        logger.log('listen for ' + this.module.id + ':task:new');
        buddy.on(this.module.id + ':task:new', function(task){
            cb(task);
        });
    }
}

class MessageAdapterHelper extends AbstractHelper{

    /**
     *
     * @param daemon
     * @param adapter
     */
    constructor(daemon, adapter){
        super(daemon, adapter);
        this.adapter = adapter;
        this.logger = LOGGER.getLogger('Message adapter [' + adapter.id + ']');
    }

    setConfig(config){
        this.adapter.setConfig(config);
        return this;
    }

    getLogger(){
        return this.logger;
    }

    getDaemon(){
        return this.daemon;
    }

    onUserConfigChange(cb){
        this.adapter.on('userConfig:update', function(config){
            cb(config)
        });
    }

    getUserConfig(){
        return this.adapter.userConfig;
    }
}

module.exports.PluginHelper = PluginHelper;
module.exports.MessageAdapterHelper = MessageAdapterHelper;
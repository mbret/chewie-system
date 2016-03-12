'use strict';

var CoreModule = require(CORE_DIR + '/plugins/core-modules/core-module.js');
var ModuleContainer = require(CORE_DIR + '/plugins/task-modules/module-container.js');
var CoreModuleHelper = require(CORE_DIR + '/plugins/core-modules/core-module-helper.js');
var ModuleHelper = require(CORE_DIR + '/plugins/task-modules/module-helper.js');
var MessageAdapterContainer = require(CORE_DIR + '/plugins/message-adapters/message-adapter.js');
var MessageAdapterHelper = require(CORE_DIR + '/plugins/message-adapters/message-adapter-helper.js');
var TaskTriggerContainer = require(CORE_DIR + '/plugins/triggers/task-trigger-container.js');
var TaskTriggerHelper = require(CORE_DIR + '/plugins/triggers/task-trigger-helper.js');
var async = require('async');
var PluginContainer = require(CORE_DIR + '/plugins/plugin-container.js');
var PluginHelper   = require(CORE_DIR + '/plugins/plugin-helper.js').PluginHelper;
var sync = require('synchronize');
var logger = LOGGER.getLogger('PluginsHandler');
var _ = require('lodash');

class PluginsHandler{

    constructor(system){
        this.system = system;
    }

    /**
     *
     * @param loadPlugins
     * @param done
     * @returns {*}
     */
    loadPlugins(done){

        var self = this;
        var repository = '';
        var plugins = [];

        if(MyBuddy.configHandler.getConfig().externalModuleRepositories){
            repository = MyBuddy.configHandler.getConfig().externalModuleRepositories[0];
        }

        async.each(MyBuddy.configHandler.getConfig().loadPlugins, function(moduleName, cb) {

            var path = repository + '/' + moduleName + '/index.js';
            logger.debug('Load plugin %s in %s', moduleName, path);
            try{
                var Module = require(path);
            }
            catch(e){
                logger.error("Unable to load package module [%s]", moduleName);
                logger.error(e);
                return cb(e);
            }

            if(!PluginsHandler.isPluginValid(Module)){
                logger.error('Module %s is invalid', moduleName);
                return cb();
            }
            else{
                try{
                    // Main plugin object wrapper
                    var plugin = new PluginContainer(moduleName);
                    var args = [moduleName, new PluginHelper(self.daemon, plugin)];

                    // Code here may be forced synchronously
                    // We need this because the helper is used as synchronous method by plugin
                    // but may do asynchronous stuff
                    sync.fiber(function(){

                        var loaded = null;
                        setTimeout(function(){
                            if(!loaded){
                                logger.warn('The plugin %s seems to take abnormal long time to load!', plugin.name);
                            }
                        }, 2000);

                        Module.apply(null, args);
                        loaded = true;

                        plugins.push(plugin);
                        return cb();
                    });
                }
                catch(e){
                    logger.error("Unable to load module [%s]", moduleName);
                    logger.error(e);
                    return cb(e);
                }
            }

        }, function(err){
            return done(err, plugins);
        });
    };

    /**
     * Check if module is valid.
     * @param Module
     * @returns {boolean}
     */
    static isPluginValid(Module){
        if(!(typeof Module === 'function')){
            return false;
        }
        //if(!(Module.prototype instanceof EventEmitter) ){
        //    return false;
        //}
        return true;
    };

    registerCoreModule(pluginId, name, module, cb){

        // Check module validity first
        if(!CoreModule.isInstanceValid(module)){
            throw new Error('Unable to register core module [' + name + '] because it\'s not a valid module');
        }

        // Extract user options
        MyBuddy.database.getAdapter('plugins').getUserOptions(pluginId, name, 'core-module', function(err, options){
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
            MyBuddy.coreModules.push(container);

            logger.verbose('Core module [%s] registered', name);

            return cb();
        });
    }

    /**
     *
     * @param pluginId
     * @param name
     * @param module
     * @param cb
     */
    registerModule(pluginId, name, module, cb){

        if(!ModuleContainer.checkModuleValidity(module, name)){
            throw new Error('Unable to register module [' + name + '] because it\'s not a valid module');
        }

        // Extract user options for this module
        // The options may be null
        MyBuddy.database.getAdapter('plugins').getUserOptions(pluginId, name, 'task-module', function(err, options){
            if(err){
                return cb(err);
            }

            if(options === null){
                options = {};
            }

            // System container
            var tmp = new ModuleContainer(MyBuddy, pluginId, name, null, options);

            // Module helper (deal with container)
            var helper = new ModuleHelper(MyBuddy, tmp);

            // Module instance
            tmp.instance = new module(helper);

            // register and attach module to daemon
            MyBuddy.userModules.push(tmp);

            logger.verbose('Module [%s] Registered', name);

            return cb();
        });
    }

    /**
     *
     * @param name
     * @param adapter
     */
    registerMessageAdapter(pluginId, name, adapter, cb){
        var self = this;

        if(!MessageAdapterContainer.isInstanceValid(adapter)){
            throw new Error('Unable to register message adapters [' + name + '] because it\'s not a valid module');
        }

        // Extract user options
        MyBuddy.database.getAdapter('plugins').getUserOptions(pluginId, name, 'message-adapter', function(err, options){
            if(err){
                return cb(err);
            }

            if(options === null){
                options = {};
            }

            // Wrap adapter for system
            var messageAdapter = new MessageAdapterContainer(pluginId, name, null, options);
            var helper = new MessageAdapterHelper(MyBuddy, messageAdapter);

            // instantiate adapter and pass helper
            var instance = new adapter(helper);

            // Store to collection
            messageAdapter.instance = instance;
            MyBuddy.messageAdaptersHandler.adapters[name] = messageAdapter;

            // keep reference for this plugin
            //this.plugin.messageAdapters.push(messageAdapter);

            logger.verbose('Adapter [%s] registered', name);
            return cb(null, 'coucou');
        });
    }

    registerTrigger(pluginId, name, adapter, cb){

        if(!TaskTriggerContainer.checkModuleValidity(adapter, name)){
            throw new Error('Unable to register message adapters [' + name + '] because it\'s not a valid module');
        }

        // Extract user options
        MyBuddy.database.getAdapter('plugins').getUserOptions(pluginId, name, 'task-trigger', function(err, options){
            if(err){
                return cb(err);
            }

            if(options === null){
                options = {};
            }

            // Wrap adapter for system
            var container = new TaskTriggerContainer(pluginId, name, null, options);
            var helper = new TaskTriggerHelper(MyBuddy, container);

            // instantiate adapter and pass helper
            var instance = new adapter(helper);

            // Store to collection
            container.instance = instance;
            MyBuddy.triggers.push(container);

            // keep reference for this plugin
            //this.plugin.messageAdapters.push(messageAdapter);

            logger.verbose('Task trigger [%s] registered', name);
            return cb();
        });
    }

    hasPlugin(id){
        return (_.find(MyBuddy.plugins, { id: id })) !== undefined;
    }

    hasTaskTrigger(id){
        return (_.find(this.system.triggers, { id: id })) !== undefined;
    }

    hasTaskModule(id){
        return (_.find(MyBuddy.userModules, { id: id })) !== undefined;
    }

    /**
     * Check if the given module exist and is active.
     * @param id
     * @param pluginId
     */
    hasActiveModule(id){
        return this.hasTaskModule(id);
    }
}

module.exports = PluginsHandler;
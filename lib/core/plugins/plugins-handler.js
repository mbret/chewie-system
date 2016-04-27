'use strict';

var CoreModule = require(CORE_DIR + '/plugins/core-modules/core-module.js');
var ModuleContainer = require(CORE_DIR + '/plugins/task-modules/module-container.js');
var CoreModuleHelper = require(CORE_DIR + '/plugins/core-modules/core-module-helper.js');
var ModuleHelper = require(CORE_DIR + '/plugins/task-modules/module-helper.js');
var MessageAdapterContainer = require(CORE_DIR + '/plugins/output-adapters').OutputAdapter;
var MessageAdapterHelper = require(CORE_DIR + '/plugins/output-adapters').OutputAdapterHelper;
var TaskTriggerContainer = require(CORE_DIR + '/plugins/triggers/task-trigger-container.js');
var TaskTriggerHelper = require(CORE_DIR + '/plugins/triggers/task-trigger-helper.js');
var async = require('async');
var PluginContainer = require(CORE_DIR + '/plugins/plugin-container.js');
var PluginHelper   = require(CORE_DIR + '/plugins/plugin-helper.js').PluginHelper;
var sync = require('synchronize');
var _ = require('lodash');
var path = require('path');
var vm = require('vm');
var utils = require('my-buddy-lib').utils;

class PluginsHandler{

    constructor(system){
        this.logger = system.logger.Logger.getLogger('PluginsHandler');

        this.system = system;
    }

    loadPlugins(profileId, pluginsToLoad, done){

        var self = this;
        var plugins = [];
        var pluginDir = this.system.getConfig().system.synchronizedPluginsDir;

        async.each(pluginsToLoad, function(pluginToLoad, cb) {

            var moduleName = pluginToLoad.name;
            var modulePath = path.resolve(pluginDir, moduleName);
            self.logger.debug('Load plugin [%s] in [%s]', moduleName, modulePath);
            try{
                var Module = require(modulePath);
                var packageJson = require(path.resolve(modulePath, 'package.json'));
                var pluginPackage = require(path.resolve(modulePath, 'plugin-package.js'));
            }
            catch(e){
                self.logger.error("Unable to load package module [%s]", moduleName);
                self.logger.error(e);
                return cb(e);
            }

            if(!PluginsHandler.isPluginValid(Module)){
                self.logger.error('Module %s is invalid', moduleName);
                return cb();
            }
            else{
                self._registerPlugin(profileId, Module, moduleName, packageJson, pluginPackage, function(err, plugin){
                    if(err){
                        self.logger.error("Unable to load module [%s]", moduleName);
                        self.logger.error(err);
                        return cb(err);
                    }
                    plugins.push(plugin);
                    return cb();
                });
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

    _registerPlugin(profileId, Module, moduleName, packageJson, pluginPackage, cb){
        var self = this;

        // Here we build options passed to the plugin.
        // These options are relative to what is defined in plugin-package.
        // We first get the default value for each option if one exist
        // Then we extract user values from database.
        // These options are dynamic and may change during runtime.
        var options = {};

        // extract plugin package options definition (with default value)
        // all options will be set with either a value or undefined
        pluginPackage.options.forEach(function(option){
            options[option.name] = option.default;
        });

        // load user options
        // We need first to retrieve the plugin in database
        this.system.orm.models.Plugins.findOne({ where: {userId: profileId, name: moduleName}})
            .then(function(data){

                // now check for values
                for (var key in data.get('userOptions')){
                    options[key] = data.get('userOptions')[key];
                }

                // Create plugin tmp, data folder
                var pluginTmpDir = path.resolve(self.system.getConfig().system.pluginsTmpDir, moduleName);
                var pluginDataDir = path.resolve(self.system.getConfig().system.pluginsDataDir, moduleName);
                utils.initDirsSync([ pluginTmpDir, pluginDataDir ]);

                // Main plugin object wrapper
                var plugin = new PluginContainer(moduleName, packageJson, pluginPackage, options, {
                    tmpDir: pluginTmpDir,
                    dataDir: pluginDataDir
                });

                // Code here may be forced synchronously
                // We need this because the helper is used as synchronous method by plugin
                // but may do asynchronous stuff
                sync.fiber(function(){

                    var loaded = null;
                    setTimeout(function(){
                        if(!loaded){
                            self.logger.warn('The plugin %s seems to take abnormal long time to load!', plugin.name);
                        }
                    }, 2000);

                    // We do not need to keep reference to plugin instance as it just register some stuff
                    // it does not need to live furthermore
                    Module.apply(null, [new PluginHelper(self.system, plugin)]);

                    loaded = true;
                    return cb(null, plugin);
                });
            })
            .catch(function(err){
                return cb(err);
            });
    }

    registerCoreModule(plugin, name, module, cb){

        if(!plugin) throw new Error('Invalid pluginId');

        // Check module validity first
        if(!CoreModule.isInstanceValid(module)){
            throw new Error('Unable to register core module [' + name + '] because it\'s not a valid module');
        }

        // Extract user options
        this.system.database.getAdapter('plugins').getUserOptions(plugin.getId(), name, 'core-module', function(err, options){
            if(err){
                return cb(err);
            }

            if(options === null){
                options = {};
            }

            // Create container
            var container = new CoreModule(plugin, name, null, options);

            // Create helper and attach to container
            var helper = new CoreModuleHelper(MyBuddy, container);

            // Instantiate module and attach to container
            container.setInstance(new module(helper));

            // register global core module
            MyBuddy.coreModules.push(container);

            self.logger.verbose('Core module [%s] registered', name);

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
    registerModule(plugin, name, module, cb){

        var self = this;

        if(!plugin) throw new Error('Invalid pluginId');

        if(!ModuleContainer.checkModuleValidity(module, name)){
            throw new Error('Unable to register module [' + name + '] because it\'s not a valid module');
        }

        // Extract user options for this module
        // The options may be null
        this.system.database.getAdapter('plugins').getUserOptions(plugin.id, name, 'task-module', function(err, options){
            if(err){
                return cb(err);
            }

            if(options === null){
                options = {};
            }

            // System container
            var tmp = new ModuleContainer(self.system, plugin, name, null, options);

            // Module helper (deal with container)
            var helper = new ModuleHelper(self.system, tmp);

            // Module instance
            tmp.instance = new module(helper);

            // register and attach module to daemon
            self.system.userModules.push(tmp);

            self.logger.verbose('Module [%s] Registered', name);

            return cb();
        });
    }

    /**
     *
     * @param name
     * @param adapter
     */
    registerOutputAdapter(plugin, name, adapter, cb){
        var self = this;

        if(!MessageAdapterContainer.isInstanceValid(adapter)){
            throw new Error('Unable to register message adapters [' + name + '] because it\'s not a valid module');
        }

        // Extract user options
        this.system.database.getAdapter('plugins').getUserOptions(plugin.getId(), name, 'output-adapter', function(err, options){
            if(err){
                return cb(err);
            }

            // merge user options with default options
            options = options || {};
            options = _.merge({
                'coucou': 'toto'
            }, options);

            // Wrap adapter for system
            var messageAdapter = new MessageAdapterContainer(self.system, plugin, name, null, options);
            var helper = new MessageAdapterHelper(self.system, messageAdapter);

            // instantiate adapter and pass helper
            var instance = new adapter(helper);

            // Store to collection
            messageAdapter.instance = instance;
            MyBuddy.outputAdaptersHandler.adapters[name] = messageAdapter;

            // keep reference for this plugin
            //this.plugin.outputAdapters.push(messageAdapter);

            self.logger.verbose('Adapter [%s] registered', name);
            return cb(null, 'coucou');
        });
    }

    registerTrigger(plugin, name, adapter, cb){

        var self = this;
        if(!plugin) throw new Error('Invalid pluginId');

        if(!TaskTriggerContainer.checkModuleValidity(adapter, name)){
            throw new Error('Unable to register message adapters [' + name + '] because it\'s not a valid module');
        }

        // Extract user options
        MyBuddy.database.getAdapter('plugins').getUserOptions(plugin.getId(), name, 'task-trigger', function(err, options){
            if(err){
                return cb(err);
            }

            if(options === null){
                options = {};
            }

            // Wrap adapter for system
            var container = new TaskTriggerContainer(plugin, name, null, options);
            var helper = new TaskTriggerHelper(MyBuddy, container);

            // instantiate adapter and pass helper
            var instance = new adapter(helper);

            // Store to collection
            container.instance = instance;
            MyBuddy.triggers.push(container);

            // keep reference for this plugin
            //this.plugin.outputAdapters.push(messageAdapter);

            self.logger.verbose('Task trigger [%s] registered', name);
            return cb();
        });
    }

    hasTaskTrigger(id){
        return (_.find(this.system.triggers, { id: id })) !== undefined;
    }

    hasTaskModule(id){
        return (_.find(this.system.userModules, { id: id })) !== undefined;
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
'use strict';

// var CoreModule = require(CORE_DIR + '/plugins/core-modules/core-module.js');
// var ModuleContainer = require(CORE_DIR + '/plugins/task-modules/module-container.js');
// var CoreModuleHelper = require(CORE_DIR + '/plugins/core-modules/core-module-helper.js');
// var ModuleHelper = require(CORE_DIR + '/plugins/task-modules/module-helper.js');
// var MessageAdapterContainer = require(CORE_DIR + '/plugins/output-adapters').OutputAdapter;
// var MessageAdapterHelper = require(CORE_DIR + '/plugins/output-adapters').OutputAdapterHelper;
// var TaskTriggerContainer = require(CORE_DIR + '/plugins/triggers/task-trigger-container.js');
// var TaskTriggerHelper = require(CORE_DIR + '/plugins/triggers/task-trigger-helper.js');
var async = require('async');
var PluginContainer = require('./plugin-container.js');
var PluginHelper   = require('./plugin-helper.js').PluginHelper;
//var Modules = require(CORE_DIR + "/plugins/modules");
var _ = require('lodash');
var path = require('path');
var utils = require('my-buddy-lib').utils;

class PluginsHandler{

    constructor(system){
        this.logger = system.logger.Logger.getLogger('PluginsHandler');

        this.system = system;
    }

    getPluginAbsolutePath(pluginName) {
        return path.resolve(this.system.config.system.synchronizedPluginsDir, pluginName);
    }

    /**
     *
     * @param profileId
     * @param pluginsToLoad
     * @param done
     */
    // loadPlugins(profileId, pluginsToLoad){
    //
    //     var self = this;
    //     var plugins = [];
    //
    //     return new Promise(function(resolve, reject) {
    //         async.each(pluginsToLoad, function(pluginToLoad, cb) {
    //
    //             var pluginName = pluginToLoad.id;
    //             var pluginPath = self.getPluginAbsolutePath(pluginName);
    //             self.logger.debug('Load plugin %s in %s', pluginName, pluginPath);
    //             // Try to load the module itself & two package info files
    //             try{
    //                 var Module = require(pluginPath);
    //                 var packageJson = require(path.resolve(pluginPath, 'package.json'));
    //                 var pluginPackage = require(path.resolve(pluginPath, 'plugin-package.js'));
    //             }
    //             catch(e){
    //                 return cb(new Error("Unable to load package module [" + pluginName + "]\n" + e.stack));
    //             }
    //
    //             if(!PluginsHandler.isPluginValid(Module)){
    //                 return cb(new Error("Module " + pluginName + " is invalid"));
    //             }
    //             else{
    //                 self.logger.debug("Module %s is valid", pluginName);
    //                 self._registerPlugin(profileId, Module, pluginName, packageJson, pluginPackage, function(err, plugin){
    //                     if(err){
    //                         return cb(new Error("Unable to load module " + pluginName + "\n" + err.stack));
    //                     }
    //                     plugins.push(plugin);
    //                     return cb();
    //                 });
    //             }
    //         }, function(err){
    //             if(err) {
    //                 return reject(err);
    //             }
    //             return resolve(plugins);
    //         });
    //     });
    // }

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
    }

    /**
     * - Fetch user options for this plugin
     * - Create the plugin container
     * - Run plugin bootstrap function
     * - Loop over pluginPackage modules to load and register them
     * - return the plugin container
     *
     * @param profileId
     * @param Plugin
     * @param moduleName
     * @param packageJson
     * @param pluginPackage
     * @param cb
     * @private
     */
    _registerPlugin(profileId, Plugin, pluginName, packageJson, pluginPackage, cb){
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
        this.system.sharedApiService.findPlugin(profileId, pluginName)
            .then(function(data){

                // now check for values
                for (var key in data.userOptions){
                    options[key] = data.userOptions[key];
                }

                // Create plugin tmp, data folder
                var pluginTmpDir = path.resolve(self.system.config.system.pluginsTmpDir, pluginName);
                var pluginDataDir = path.resolve(self.system.config.system.pluginsDataDir, pluginName);
                utils.initDirsSync([ pluginTmpDir, pluginDataDir ]);

                // Main plugin object wrapper
                var plugin = new PluginContainer(data.id, pluginName, packageJson, pluginPackage, options, {
                    tmpDir: pluginTmpDir,
                    dataDir: pluginDataDir
                });

                // Run the plugin bootstrap function.
                var loaded = null;
                setTimeout(function(){
                    if(!loaded){
                        self.logger.warn('The plugin %s seems to take abnormal long time to load!. Maybe the callback has not been call?', plugin.name);
                    }
                }, 2000);

                // We do not need to keep reference to plugin instance as it just register some stuff
                // it does not need to live furthermore
                Plugin.call(null, new PluginHelper(self.system, plugin), function(err) {
                    loaded = true;
                    if(err) {
                        return cb(err);
                    }

                    var errors = self.checkModulePackageConfig(pluginPackage.modules);
                    if(errors.length > 0) {
                        return cb(new Error("Your modules package config does not seems to be valid. " + errors));
                    }

                    // Now the module has ran its bootstrap we will read the plugin package info and
                    // register its modules.
                    async.each(pluginPackage.modules, function(moduleToRegister, cbModuleToRegister) {

                        // contain module info
                        var moduleInfo = data.modules.find(function(module) {
                            return module.name === moduleToRegister.name;
                        });
                        var modulePath = moduleToRegister.module;
                        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
                        // ./module will become D://foo/bar/plugins/module
                        if (!path.isAbsolute(modulePath)) {
                            modulePath = path.resolve(self.getPluginAbsolutePath(pluginName), "module");
                        }
                        var module = require(modulePath);
                        self.loadModule(profileId, plugin, moduleInfo.name, moduleInfo.id, moduleToRegister, module, cbModuleToRegister);
                    }, function(err) {
                        return cb(err, plugin);
                    });
                });
            })
            .catch(function(err){
                return cb(err);
            });
    }

    /**
     * @param {object[]} modulesConfig
     * @private
     */
    checkModulePackageConfig(modulesConfig) {
        var errors = [];
        modulesConfig.forEach(function(moduleConfig) {
            if(!_.isString(moduleConfig.module)) {
                errors.push("module attribute is missing or invalid. Should be an absolute path.");
            }
        });

        return errors;
    }

    // registerCoreModule(plugin, name, module, cb){
    //
    //     if(!plugin) throw new Error('Invalid pluginId');
    //
    //     // Check module validity first
    //     if(!CoreModule.isInstanceValid(module)){
    //         throw new Error('Unable to register core module [' + name + '] because it\'s not a valid module');
    //     }
    //
    //     // Extract user options
    //     this.system.database.getAdapter('plugins').getUserOptions(plugin.getId(), name, 'core-module', function(err, options){
    //         if(err){
    //             return cb(err);
    //         }
    //
    //         if(options === null){
    //             options = {};
    //         }
    //
    //         // Create container
    //         var container = new CoreModule(plugin, name, null, options);
    //
    //         // Create helper and attach to container
    //         var helper = new CoreModuleHelper(MyBuddy, container);
    //
    //         // Instantiate module and attach to container
    //         container.setInstance(new module(helper));
    //
    //         // register global core module
    //         MyBuddy.coreModules.push(container);
    //
    //         self.logger.verbose('Core module [%s] registered', name);
    //
    //         return cb();
    //     });
    // }

    /**
     *
     * @param plugin
     * @param name
     * @param module
     * @param cb
     */
    //registerModule(plugin, name, module, cb){
    //
    //    var self = this;
    //
    //    if(!plugin) throw new Error('Invalid pluginId');
    //
    //    if(!ModuleContainer.checkModuleValidity(module, name)){
    //        throw new Error('Unable to register module [' + name + '] because it\'s not a valid module');
    //    }
    //
    //    // Extract user options for this module
    //    // The options may be null
    //    this.system.database.getAdapter('plugins').getUserOptions(plugin.id, name, 'task-module', function(err, options){
    //        if(err){
    //            return cb(err);
    //        }
    //
    //        if(options === null){
    //            options = {};
    //        }
    //
    //        // System container
    //        var tmp = new ModuleContainer(self.system, plugin, name, null, options);
    //
    //        // Module helper (deal with container)
    //        var helper = new ModuleHelper(self.system, tmp);
    //
    //        // Module instance
    //        tmp.instance = new module(helper);
    //
    //        // register and attach module to daemon
    //        self.system.userModules.push(tmp);
    //
    //        self.logger.verbose('Module [%s] Registered', name);
    //
    //        return cb();
    //    });
    //}

    /**
     *
     * @param profileId
     * @param {PluginContainer} plugin
     * @param moduleName
     * @param moduleId
     * @param modulePackageConfig
     * @param moduleClass
     * @param cb
     * @returns {*}
     */
    // loadModule(profileId, plugin, moduleName, moduleId, modulePackageConfig, moduleClass, cb) {
    //     var self = this;
    //
    //     // check module validity
    //     if(!(typeof moduleClass === 'function')){
    //         return cb(new Error("Invalid module (Not a function or class)"));
    //     }
    //     if(!(typeof moduleClass.prototype.initialize === 'function')){
    //         return cb(new Error("Invalid module (No prototype initialize function)"));
    //     }
    //
    //     if(!(typeof moduleClass.prototype.destroy === 'function')){
    //         this.logger.verbose("The module %s does not have destroy method. A generic one has been created but you should get in touch with the module creator.", moduleName);
    //         moduleClass.prototype.destroy = function(cb) { return cb() };
    //     }
    //
    //     // Relative to task modules
    //     if(modulePackageConfig.type === "task" && !(typeof moduleClass.prototype.newTask === 'function')){
    //         this.logger.verbose("The module %s does not have newTask method. A generic one has been created but you should get in touch with the module creator.", moduleName);
    //         moduleClass.prototype.newTask = function() {  };
    //     }
    //
    //     // Fetch module from api to get some info like user options
    //     this.system.sharedApiService.findModuleByName(profileId, plugin.name, moduleName)
    //         .then(function(module) {
    //             if(!module) {
    //                 return cb(new Error("Unable to retrieve module " + moduleName));
    //             }
    //
    //             // System container for this module
    //             var tmp = new Modules.Container(self.system, plugin, module.options, null, moduleName, moduleId, modulePackageConfig);
    //
    //             // Module helper (deal with container)
    //             var helper = new Modules.Helper(self.system, tmp);
    //
    //             // Module instance
    //             try {
    //                 tmp.instance = new moduleClass(helper);
    //             } catch (err) {
    //                 return cb(err);
    //             }
    //
    //             // register and attach module to daemon
    //             self.logger.debug("Module with name %s loaded with map key %s", moduleName, tmp.id);
    //             self.system.runtime.modules.set(tmp.id, tmp);
    //
    //             self.logger.verbose('Module %s correctly loaded in runtime', moduleName);
    //
    //             return cb();
    //         })
    //         .catch(cb);
    // }

    /**
     *
     * @param name
     * @param adapter
     */
    // registerOutputAdapter(plugin, name, adapter, cb){
    //     var self = this;
    //
    //     if(!MessageAdapterContainer.isInstanceValid(adapter)){
    //         throw new Error('Unable to register message adapters [' + name + '] because it\'s not a valid module');
    //     }
    //
    //     // Extract user options
    //     this.system.database.getAdapter('plugins').getUserOptions(plugin.getId(), name, 'output-adapter', function(err, options){
    //         if(err){
    //             return cb(err);
    //         }
    //
    //         // merge user options with default options
    //         options = options || {};
    //         options = _.merge({
    //             'coucou': 'toto'
    //         }, options);
    //
    //         // Wrap adapter for system
    //         var messageAdapter = new MessageAdapterContainer(self.system, plugin, name, null, options);
    //         var helper = new MessageAdapterHelper(self.system, messageAdapter);
    //
    //         // instantiate adapter and pass helper
    //         var instance = new adapter(helper);
    //
    //         // Store to collection
    //         messageAdapter.instance = instance;
    //         MyBuddy.outputAdaptersHandler.adapters[name] = messageAdapter;
    //
    //         // keep reference for this plugin
    //         //this.plugin.outputAdapters.push(messageAdapter);
    //
    //         self.logger.verbose('Adapter [%s] registered', name);
    //         return cb(null, 'coucou');
    //     });
    // }

    // registerTrigger(plugin, name, adapter, cb){
    //
    //     var self = this;
    //     if(!plugin) throw new Error('Invalid pluginId');
    //
    //     if(!TaskTriggerContainer.checkModuleValidity(adapter, name)){
    //         throw new Error('Unable to register message adapters [' + name + '] because it\'s not a valid module');
    //     }
    //
    //     // Extract user options
    //     MyBuddy.database.getAdapter('plugins').getUserOptions(plugin.getId(), name, 'task-trigger', function(err, options){
    //         if(err){
    //             return cb(err);
    //         }
    //
    //         if(options === null){
    //             options = {};
    //         }
    //
    //         // Wrap adapter for system
    //         var container = new TaskTriggerContainer(plugin, name, null, options);
    //         var helper = new TaskTriggerHelper(MyBuddy, container);
    //
    //         // instantiate adapter and pass helper
    //         var instance = new adapter(helper);
    //
    //         // Store to collection
    //         container.instance = instance;
    //         MyBuddy.triggers.push(container);
    //
    //         // keep reference for this plugin
    //         //this.plugin.outputAdapters.push(messageAdapter);
    //
    //         self.logger.verbose('Task trigger [%s] registered', name);
    //         return cb();
    //     });
    // }

    // hasTaskTrigger(id){
    //     return (_.find(this.system.triggers, { id: id })) !== undefined;
    // }

    // hasTaskModule(id){
    //     return (_.find(this.system.userModules, { id: id })) !== undefined;
    // }

    /**
     * Check if the given module exist and is active.
     * @param {string} moduleId pluginName:moduleName
     */
    // hasActiveModule(moduleId){
    //     console.log(this.system.runtime.modules.keys());
    //     return this.hasTaskModule(moduleId);
    // }
}

module.exports = PluginsHandler;
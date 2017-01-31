'use strict';
const async = require('async');
const PluginContainer = require('./plugin-container.js');
const PluginHelper = require('./plugin-helper.js').PluginHelper;
const _ = require('lodash');
const path = require('path');
const utils = require('my-buddy-lib').utils;
class PluginsHandler {
    constructor(system) {
        this.logger = system.logger.getLogger('PluginsHandler');
        this.system = system;
        this.synchronizedPluginsPath = path.join(this.system.config.dataPath, this.system.config.system.synchronizedPluginsDir);
    }
    getPluginAbsolutePath(pluginName) {
        return path.resolve(this.synchronizedPluginsPath, pluginName);
    }
    static isPluginValid(Module) {
        if (!(typeof Module === 'function')) {
            return false;
        }
        return true;
    }
    _registerPlugin(profileId, Plugin, pluginName, packageJson, pluginPackage, cb) {
        var self = this;
        var options = {};
        pluginPackage.options.forEach(function (option) {
            options[option.name] = option.default;
        });
        this.system.sharedApiService.findPlugin(profileId, pluginName)
            .then(function (data) {
            for (var key in data.userOptions) {
                options[key] = data.userOptions[key];
            }
            var pluginTmpDir = path.resolve(self.system.config.system.pluginsTmpDir, pluginName);
            var pluginDataDir = path.resolve(self.system.config.system.pluginsDataDir, pluginName);
            utils.initDirsSync([pluginTmpDir, pluginDataDir]);
            var plugin = new PluginContainer(data.id, pluginName, packageJson, pluginPackage, options, {
                tmpDir: pluginTmpDir,
                dataDir: pluginDataDir
            });
            var loaded = null;
            setTimeout(function () {
                if (!loaded) {
                    self.logger.warn('The plugin %s seems to take abnormal long time to load!. Maybe the callback has not been call?', plugin.name);
                }
            }, 2000);
            Plugin.call(null, new PluginHelper(self.system, plugin), function (err) {
                loaded = true;
                if (err) {
                    return cb(err);
                }
                var errors = self.checkModulePackageConfig(pluginPackage.modules);
                if (errors.length > 0) {
                    return cb(new Error("Your modules package config does not seems to be valid. " + errors));
                }
                async.each(pluginPackage.modules, function (moduleToRegister, cbModuleToRegister) {
                    var moduleInfo = data.modules.find(function (module) {
                        return module.name === moduleToRegister.name;
                    });
                    var modulePath = moduleToRegister.module;
                    if (!path.isAbsolute(modulePath)) {
                        modulePath = path.resolve(self.getPluginAbsolutePath(pluginName), "module");
                    }
                    var module = require(modulePath);
                    self.loadModule(profileId, plugin, moduleInfo.name, moduleInfo.id, moduleToRegister, module, cbModuleToRegister);
                }, function (err) {
                    return cb(err, plugin);
                });
            });
        })
            .catch(function (err) {
            return cb(err);
        });
    }
    checkModulePackageConfig(modulesConfig) {
        var errors = [];
        modulesConfig.forEach(function (moduleConfig) {
            if (!_.isString(moduleConfig.module)) {
                errors.push("module attribute is missing or invalid. Should be an absolute path.");
            }
        });
        return errors;
    }
}
module.exports = PluginsHandler;
//# sourceMappingURL=plugins-handler.js.map
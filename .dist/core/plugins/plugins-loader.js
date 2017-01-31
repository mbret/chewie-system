"use strict";
const _ = require("lodash");
const path = require("path");
const plugin_helper_1 = require("./plugin-helper");
const plugin_container_1 = require("./plugin-container");
const error_1 = require("../error");
const util = require("util");
class PluginsLoader {
    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('PluginsLoader');
        this.synchronizedPluginsPath = path.join(this.system.config.system.appDataPath, this.system.config.system.synchronizedPluginsDir);
    }
    load(plugin) {
        let self = this;
        if (self.system.runtime.plugins.get(plugin.name)) {
            return Promise.reject(new error_1.SystemError("Plugin " + plugin.name + " already loaded. Trying to load a plugin while it has already be loaded", error_1.SystemError.ERROR_CODE_PLUGIN_ALREADY_LOADED));
        }
        return this
            .synchronize(plugin)
            .then(function () {
            let container = new plugin_container_1.PluginContainer(self.system, plugin, null);
            let helper = new plugin_helper_1.PluginHelper(self.system, container);
            self.system.runtime.plugins.set(plugin.name, container);
            return new Promise(function (resolve, reject) {
                let PluginInstance = self.getPluginInstance(plugin);
                let instance = _.assign(new DefaultPluginInstance(), new PluginInstance());
                container.instance = instance;
                instance.onLoad(helper, function (err) {
                    if (err) {
                        self.system.runtime.plugins.delete(plugin.name);
                        self.system.emit("plugins:updated");
                        return reject(err);
                    }
                    else {
                        self.system.emit("plugins:updated");
                        return resolve(container);
                    }
                });
            });
        });
    }
    unLoad(plugin) {
        let self = this;
        let pluginContainer = self.system.runtime.plugins.get(plugin.name);
        self.system.runtime.plugins.delete(plugin.name);
        self.system.emit("plugins:updated");
        return new Promise(function (resolve) {
            pluginContainer.instance.onStop(function () {
                return resolve();
            });
        });
    }
    isPluginLoaded(plugin) {
        return this.system.runtime.plugins.get(plugin.name);
    }
    getPluginInstance(plugin) {
        plugin.package = this.getPluginInfo(plugin.name);
        if (!plugin.package.pluginInstance) {
            return DefaultPluginInstance;
        }
        let modulePath = plugin.package.pluginInstance;
        if (!path.isAbsolute(modulePath)) {
            let pluginAbsolutePath = path.resolve(this.synchronizedPluginsPath, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }
        this.logger.debug("plugin path %s", modulePath);
        return require(modulePath);
    }
    getPluginInfo(name) {
        return this.system.localRepository.loadPackageFile(path.resolve(this.synchronizedPluginsPath, name));
    }
    synchronize(plugin) {
        let self = this;
        return this.system.repository
            .pluginExist(plugin.name)
            .then(function (pluginStats) {
            if (self.system.config.forcePluginsSynchronizeAtStartup) {
                self.logger.verbose("Force plugin %s to synchronize. Synchronizing..", plugin.name);
            }
            if (!pluginStats.exist || !pluginStats.isValid) {
                self.logger.verbose("Plugin %s does not seems to be synchronizing yet. Synchronizing..", plugin.name);
            }
            if (self.system.config.forcePluginsSynchronizeAtStartup || !pluginStats.exist || !pluginStats.isValid) {
                return self.system.repository.synchronize([plugin]);
            }
        });
    }
}
exports.PluginsLoader = PluginsLoader;
class DefaultPluginInstance {
    onLoad(helper, cb) {
        return cb();
    }
    onStop(cb) {
        return cb();
    }
}
exports.DefaultPluginInstance = DefaultPluginInstance;
//# sourceMappingURL=plugins-loader.js.map
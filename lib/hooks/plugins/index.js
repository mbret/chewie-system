"use strict";
let _ = require('lodash');
const hook_interface_1 = require("../../core/hook-interface");
module.exports = class PluginsHook extends hook_interface_1.Hook {
    initialize() {
        let self = this;
        this.system.on("ready", function () {
            self.system.sharedApiService
                .getAllPlugins()
                .then(function (response) {
                let plugins = response.body;
                if (!plugins.length) {
                    self.logger.verbose("There are no plugins to load");
                }
                else {
                    return self.synchronizePlugins(plugins);
                }
            })
                .catch(function (err) {
                self.logger.warn("Unable to load plugins automatically", err.message);
                return self.system.sharedApiService.createNotification("Unable to load plugins automatically", "warning");
            });
        });
        this.system.repository.on("plugin:synchronized", function (plugin) {
            self.logger.verbose("New plugin %s synchronized detected", plugin.name);
            return self.loadPlugin(plugin);
        });
        this.system.sharedApiService.io.on("plugin:created", function (plugin) {
            if (plugin.deviceId === self.system.id) {
                self.logger.verbose("New plugin %s created detected", plugin.name);
                return self.synchronizePlugins([plugin]);
            }
        });
        this.system.sharedApiService.io.on("plugin:deleted", function (plugin) {
            if (plugin.deviceId === self.system.id && self.system.runtime.plugins.get(plugin.name)) {
                self.logger.verbose("Plugin %s deletion detected", plugin.name);
                self.unLoadPlugins([plugin]);
            }
        });
        return Promise.resolve();
    }
    getLogger() {
        return this.system.logger.Logger.getLogger('PluginsHook');
    }
    synchronizePlugins(plugins) {
        this.logger.verbose('Synchronizing plugins [%s]', _.map(plugins, "name"));
        return this.system.repository.synchronize(plugins);
    }
    loadPlugin(plugin) {
        let self = this;
        self.logger.verbose('Loading plugin %s', plugin.name);
        return self.system.pluginsLoader
            .load(plugin)
            .then(function () {
            self.logger.verbose("Plugin %s loaded", plugin.name);
        });
    }
    unLoadPlugins(plugins) {
        let self = this;
        this.logger.verbose('Unloading plugins [%s]', _.map(plugins, "name"));
        plugins.forEach(function (plugin) {
            self.system.runtime.plugins.delete(plugin.name);
        });
    }
}
;

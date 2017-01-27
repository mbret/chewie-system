"use strict";
let _ = require('lodash');
const hook_interface_1 = require("../../core/hook-interface");
const scenario_helper_1 = require("../../core/scenario/scenario-helper");
module.exports = class PluginsHook extends hook_interface_1.Hook {
    constructor(system) {
        super(system);
        this.scenariosHelper = new scenario_helper_1.ScenarioHelper(this.system);
    }
    initialize() {
        let self = this;
        this.system.on("ready", function () {
            self.system.sharedApiService
                .getAllPlugins()
                .then(function (response) {
                let plugins = response.body;
                self.logger.verbose("%s plugin(s) found, load all of them and synchronize if needed", plugins.length);
                plugins.forEach(function (plugin) {
                    return self.loadPlugin(plugin);
                });
            })
                .catch(function (err) {
                self.logger.warn("Unable to load plugins automatically", err.message);
                return self.system.sharedApiService.createNotification("Unable to load plugins automatically", "warning");
            });
        });
        this.system.sharedApiService.io.on("plugin:created", function (plugin) {
            if (plugin.deviceId === self.system.id) {
                self.logger.verbose("New plugin %s created detected", plugin.name);
                self.logger.verbose('Synchronizing plugin %s', plugin.name);
                return self.loadPlugin(plugin);
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
        return this.system.logger.getLogger('PluginsHook');
    }
    loadPlugin(plugin) {
        let self = this;
        self.logger.verbose('Loading plugin %s', plugin.name);
        return Promise.resolve(self.system.pluginsLoader.isPluginLoaded(plugin))
            .then(function (loaded) {
            if (loaded) {
                return Promise.resolve();
            }
            else {
                return self.system.pluginsLoader.load(plugin)
                    .then(function () {
                    self.logger.verbose("Plugin %s loaded", plugin.name);
                });
            }
        });
    }
    unLoadPlugins(plugins) {
        let self = this;
        this.logger.verbose('Unloading plugins [%s]', _.map(plugins, "name"));
        plugins.forEach(function (plugin) {
            return self.system.pluginsLoader.unLoad(plugin);
        });
    }
};

"use strict";

let _ = require('lodash');
import {HookInterface, Hook} from "../../core/hook-interface";
import {System} from "../../system";
import {ScenarioHelper} from "../../core/scenario/scenario-helper";

export = class PluginsHook extends Hook implements HookInterface, InitializeAbleInterface {

    scenariosHelper: ScenarioHelper;

    constructor(system: System) {
        super(system);
        this.scenariosHelper = new ScenarioHelper(this.system);
    }

    initialize() {
        let self = this;

        // make sure shared api server is running
        this.system.on("ready", function() {
            // Fetch all plugins to synchronize the plugins not yet synchronized
            self.system.sharedApiService
                .getAllPlugins()
                .then(function(response: any) {
                    let plugins: Array<Plugin> = response.body;
                    self.logger.verbose("%s plugin(s) found, load all of them and synchronize if needed", plugins.length);
                    plugins.forEach(function(plugin) {
                        return self.loadPlugin(plugin);
                    });
                })
                .catch(function(err) {
                    self.logger.warn("Unable to load plugins automatically", err.message);
                    return self.system.sharedApiService.createNotification("Unable to load plugins automatically", "warning");
                });
        });

        // listen for newly synchronized plugins
        // this.system.on("plugin:synchronized", function(plugin) {
        //     self.logger.verbose("New plugin %s synchronized detected", plugin.name);
        //     return self.loadPlugin(plugin);
        // });

        // Listen for new plugin
        this.system.sharedApiService.io.on("plugin:created", function(plugin: Plugin) {
            if (plugin.deviceId === self.system.id) {
                self.logger.verbose("New plugin %s created detected", plugin.name);
                self.logger.verbose('Synchronizing plugin %s', plugin.name);
                return self.loadPlugin(plugin);
            }
        });

        // Listen for plugin deletion
        this.system.sharedApiService.io.on("plugin:deleted", function(plugin: Plugin) {
            // ensure we are on the right device
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
            .then(function(loaded) {
                if (loaded) {
                    return Promise.resolve();
                } else {
                    return self.system.pluginsLoader.load(plugin)
                        .then(function() {
                            self.logger.verbose("Plugin %s loaded", plugin.name);
                        });
                }
            });
    }

    /**
     * - remove the reference of plugin to the system
     * @param plugins
     */
    unLoadPlugins(plugins) {
        let self = this;
        this.logger.verbose('Unloading plugins [%s]', _.map(plugins, "name"));
        plugins.forEach(function(plugin) {
            return self.system.pluginsLoader.unLoad(plugin);
        });
    }
}
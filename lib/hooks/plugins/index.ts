"use strict";

let _ = require('lodash');
import {HookInterface, Hook} from "../../core/hook-interface";

export = class PluginsHook extends Hook implements HookInterface, InitializeAbleInterface {

    initialize(){
        let self = this;

        // make sure shared api server is running
        this.system.on("ready", function() {
            self.system.sharedApiService
                .getAllPlugins()
                .then(function(response: any) {
                    let plugins = response.body;
                    if (!plugins.length) {
                        self.logger.verbose("There are no plugins to load");
                    } else {
                        return self.synchronizePlugins(plugins);
                    }
                })
                .catch(function(err) {
                    self.logger.warn("Unable to load plugins automatically", err.message);
                    return self.system.sharedApiService.createNotification("Unable to load plugins automatically", "warning");
                });
        });

        // listen for newly synchronized plugins
        this.system.repository.on("plugin:synchronized", function(plugin) {
            self.logger.verbose("New plugin %s synchronized detected", plugin.name);
            return self.loadPlugin(plugin);
        });

        // Listen for new plugin
        this.system.sharedApiService.io.on("plugin:created", function(plugin: Plugin) {
            if (plugin.deviceId === self.system.id) {
                self.logger.verbose("New plugin %s created detected", plugin.name);
                return self.synchronizePlugins([plugin]);
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
        return this.system.logger.Logger.getLogger('PluginsHook');
    }

    /**
     * - copy plugins to local dir
     * @param plugins
     * @returns {any}
     */
    synchronizePlugins(plugins) {
        this.logger.verbose('Synchronizing plugins [%s]', _.map(plugins, "name"));
        return this.system.repository.synchronize(plugins);
    }

    loadPlugin(plugin) {
        let self = this;
        self.logger.verbose('Loading plugin %s', plugin.name);
        return self.system.pluginsLoader
            .load(plugin)
            .then(function() {
                self.logger.verbose("Plugin %s loaded", plugin.name);
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
            // @todo trigger plugin deletion
            self.system.runtime.plugins.delete(plugin.name);
        });
    }
}
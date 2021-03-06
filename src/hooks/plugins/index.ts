"use strict";

let _ = require('lodash');
import {HookInterface} from "../../core/hook-interface";
import {System} from "../../system";
import {ScenarioHelper} from "../../core/scenario/scenario-helper";
import {PluginsLoader} from "../../core/plugins/plugins-loader";
import {debug as hookDebug} from "../../shared/debug";
import {Hook} from "../../core/hook";
import {PluginModel} from "../../core/shared-server-api/lib/models/plugins";
let debug = hookDebug(":hook:plugins");

export = class PluginsHook extends Hook implements HookInterface {

    scenariosHelper: ScenarioHelper;
    protected customListeners: any;
    protected pluginsLoader: PluginsLoader;

    constructor(system: System, config: any) {
        super(system, config);
        this.scenariosHelper = new ScenarioHelper(this.system);
        this.customListeners = {};
        this.pluginsLoader = new PluginsLoader(system);
    }

    initialize() {
        let self = this;

        // make sure shared api server is running
        this.system.once("ready", function() {
            // Fetch all plugins to synchronize the plugins not yet synchronized
            self.system.sharedApiService
                .getAllPlugins()
                .then(function(response: any) {
                    let plugins: Array<PluginModel> = response.body;
                    debug("%s plugin(s) found, load all of them and synchronize if needed", plugins.length);
                    plugins.forEach(function(plugin) {
                        return self.loadPlugin(plugin);
                    });
                })
                .catch(function(err) {
                    self.logger.error("Unable to load plugins automatically", err.message);
                    return self.system.sharedApiService.createNotification("Unable to load plugins automatically", "warning");
                });

            // Listen for new plugin
            self.customListeners.pluginCreated = self.system.sharedApiService.io.on("plugin:created", function(plugin: PluginModel) {
                if (plugin.deviceId === self.system.id) {
                    debug("New plugin %s created detected", plugin.name);
                    return self.loadPlugin(plugin, true);
                }
            });

            // Listen for plugin deletion
            self.customListeners.pluginDeleted = self.system.sharedApiService.io.on("plugin:deleted", function(plugin: PluginModel) {
                // ensure we are on the right device
                if (plugin.deviceId === self.system.id) {
                    debug("Plugin %s has been deleted on storage", plugin.name);
                    self.unLoadPlugins([plugin]);
                }
            });
        });

        return Promise.resolve();
    }

    onShutdown() {
        // clean listeners
        this.system.sharedApiService.io.removeListener("plugin:deleted", this.customListeners.pluginDeleted);
        this.system.sharedApiService.io.removeListener("plugin:created", this.customListeners.pluginCreated);

        return Promise.resolve();
    }

    getLogger() {
        return this.system.logger.getLogger('PluginsHook');
    }

    /**
     * @param plugin
     * @param reload
     * @returns {Promise}
     * @todo reload with self.pluginsLoader.reMount
     */
    loadPlugin(plugin: PluginModel, reload = false) {
        let self = this;
        debug('%s plugin %s', reload ? "Reloading" : "Load", plugin.name);
        let container = self.pluginsLoader.getPluginContainerByName(plugin.name);
        if (reload && container) {
            container.unmount();
        }
        return self.pluginsLoader.mount(plugin)
            .then(function() {
                debug("Plugin %s loaded", plugin.name);
            });
    }

    /**
     * - remove the reference of plugin to the system
     * @param plugins
     */
    unLoadPlugins(plugins: Array<PluginModel>) {
        let self = this;
        debug('Unloading plugins [%s]', _.map(plugins, "name"));
        plugins.forEach(function(plugin) {
            let container = self.pluginsLoader.getPluginContainerByName(plugin.name);
            if (container) {
                container.unmount();
            }
        });
    }
}
"use strict";

let _ = require('lodash');
import {HookInterface} from "../../core/hook-interface";
import {System} from "../../system";
import {ScenarioHelper} from "../../core/scenario/scenario-helper";
import {PluginsLoader} from "../../core/plugins/plugins-loader";
import {debug as hookDebug} from "../../shared/debug";
import {SystemError} from "../../core/error";
import {Plugin} from "../shared-server-api/lib/models/plugins";
import {Hook} from "../../core/hook";
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
                    let plugins: Array<Plugin> = response.body;
                    debug("%s plugin(s) found, load all of them and synchronize if needed", plugins.length);
                    plugins.forEach(function(plugin) {
                        return self.loadPlugin(plugin);
                    });
                })
                .catch(function(err) {
                    self.logger.error("Unable to load plugins automatically", err.message);
                    return self.system.sharedApiService.createNotification("Unable to load plugins automatically", "warning");
                });
        });

        // Listen for new plugin
        self.customListeners.pluginCreated = this.system.sharedApiService.io.on("plugin:created", function(plugin: Plugin) {
            if (plugin.deviceId === self.system.id) {
                debug("New plugin %s created detected", plugin.name);
                debug('Loading plugin %s', plugin.name);
                return self.loadPlugin(plugin, true);
            }
        });

        // Listen for plugin deletion
        self.customListeners.pluginDeleted = this.system.sharedApiService.io.on("plugin:deleted", function(plugin: Plugin) {
            // ensure we are on the right device
            if (plugin.deviceId === self.system.id) {
                debug("Plugin %s has been deleted on storage", plugin.name);
                self.unLoadPlugins([plugin]);
            }
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
    loadPlugin(plugin, reload = false) {
        let self = this;
        return self.pluginsLoader.mount(plugin)
            .catch(function(err) {
                if (err.code !== SystemError.ERROR_CODE_PLUGIN_ALREADY_MOUNTED) {
                    throw err;
                } else {
                    return Promise.resolve();
                }
            })
            .then(function() {
                debug("Plugin %s loaded", plugin.name);
            });
    }

    /**
     * - remove the reference of plugin to the system
     * @param plugins
     */
    unLoadPlugins(plugins: Array<Plugin>) {
        let self = this;
        debug('Unloading plugins [%s]', _.map(plugins, "name"));
        plugins.forEach(function(plugin) {
            return self.pluginsLoader.unmount(plugin.name)
                .catch(function(err) {
                    if (err.code !== SystemError.ERROR_CODE_PLUGIN_NOT_FOUNT) {
                        throw err;
                    }
                });
        });
    }
}
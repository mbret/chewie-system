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
import {PluginContainer} from "../../core/plugins/plugin-container";
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

        //
        // setTimeout(function() {
        //     self.system.sharedApiService
        //         .getAllPlugins()
        //         .then(function(response: any) {
        //             let plugin: Plugin = response.body[0];
        //             self.pluginsLoader.mount(plugin).then(function(container: PluginContainer) {
        //                 console.log("mounted 1 SUCCESS", container.state);
        // //                 // setImmediate(function() {
        // //                 //     container.lock(function(unlock) {
        //                         container.unmount().then(function() {
        //                             console.log("unmount 1 SUCCESS", container.state);
        //                         }).catch(function(err) {
        //                             console.error("unmount 1 FAIL", err);
        //                         });
        //                         self.pluginsLoader.mount(plugin).then(function() {
        //                             console.log("remount 1 SUCCESS");
        //                         }).catch(function(err) {
        //                             console.error("remount 1 FAIL", err);
        //                         });
        // //                         // unlock();
        // //                     // });
        // //                 // });
        //             }).catch(function(err) {
        //                 console.error("mounted 1 FAIL", err);
        //             });
        // //             self.pluginsLoader.mount(plugin).then(function(container: PluginContainer) {
        // //                 console.log("mounted 2 SUCCESS", container.state);
        // //                 container.mount().then(function() {
        // //                     console.log("remount 2 SUCCESS", container.state);
        // //                 }).catch(function(err) {
        // //                     console.error("remount 2 FAIL", err);
        // //                 });
        // //                 // self.pluginsLoader.mount(plugin, {}, "ask for mount 5").then(function(container: PluginContainer) {
        // //                 //     console.log("mounted 5 SUCCESS", container.state);
        // //                 // }).catch(function(err) {
        // //                 //     console.error("mounted 5 FAIL", err);
        // //                 // });
        // //                 container.unmount().then(function() {
        // //                     console.log("unmount 6 SUCCESS");
        // //             // //         container.mount().then(function() {
        // //             // //             console.log("remount 2");
        // //             // //         }).catch(function(err) {
        // //             // //             console.error("remount 2 FAIL", err);
        // //             // //         });
        // //                 }).catch(function(err) {
        // //                     console.error("unmount 6 FAIL", err);
        // //                 });
        // //             }).catch(function(err) {
        // //                 console.error("mounted 2 FAIL", err);
        // //             });
        // //             // setTimeout(function() {
        // //             //     self.pluginsLoader.mount(plugin, {}, "ask for mount 4").then(function(container: PluginContainer) {
        // //             //         console.log("mounted 4", container.state);
        // //             //     }).catch(function(err) {
        // //             //         console.error("mounted 4 FAIL", err);
        // //             //     });
        // //             // }, 2000)
        //         })
        // }, 3000);
        // return Promise.resolve();


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
    unLoadPlugins(plugins: Array<Plugin>) {
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
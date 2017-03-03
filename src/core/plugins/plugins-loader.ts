"use strict";

import * as _ from "lodash";
import * as path from "path"
import {PluginContainer} from "./plugin-container";
import {System} from "../../system";
import {SystemError} from "../error";
const util = require("util");
const Semaphore = require('semaphore');
import {debug} from "../../shared/debug";
import {Plugin} from "../../hooks/shared-server-api/lib/models/plugins";
import {ScenarioHelper} from "../scenario/scenario-helper";
let assert = require("chai").assert;
let decache = require('decache');
import * as Promise from "bluebird";

export class PluginsLoader {

    static PACKAGE_FILE_NAME_JSON = "package.json";

    system: System;
    logger: any;

    // object with plugin id as key (one plugin access at a time)
    protected static semaphores: any = {};
    protected static plugins: Array<PluginContainer> = [];

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('PluginsLoader');

        // register clean up task
        this.system.garbageCollector.registerTask(() => {
            // task for cleanup semaphore and avoid having semaphores collection growing up as
            // the plugins grow up. Every new plugin mounted create a new entry in semaphore collection and may become
            // very huge after long execution time.
            _.forEach(_.clone(PluginsLoader.semaphores), function(semaphore, pluginName) {
                // semaphore is empty we can remove it
                if (semaphore.queue.length === 0) {
                    debug("plugins")("Semaphore for plugin %s is not active anymore and has been cleaned", pluginName);
                    delete PluginsLoader.semaphores[pluginName];
                }
            });
        });
    }

    /**
     * Mount a plugin
     * @param plugin
     * @param options
     * @returns {any}
     */
    public mount(plugin: Plugin, options: any = {}) {
        let self = this;
        let scenarioHelper = new ScenarioHelper(this.system);
        options = _.merge({forceSynchronize: this.system.config.alwaysSynchronizePlugins}, options);

        if (!(plugin instanceof Object)) {
            throw new Error("plugin must be an instance of plugin model. " + typeof plugin + " given!");
        }

        debug("plugins")("Mount demand for plugin %s", plugin.name);

        return Promise.resolve()
            .then(function() {
                // create container or retrieve existing
                let container: PluginContainer = null;
                let existingContainer = PluginsLoader.plugins.find((container) => container.plugin.name === plugin.name);
                if (existingContainer) {
                    return existingContainer;
                } else {
                    container = new PluginContainer(self.system, plugin);
                    // add to global storage
                    PluginsLoader.plugins.push(container);
                    container.once("mounted", function() {
                        debug("plugins")("Plugin %s fully mounted and ready", plugin.name);
                        self.system.emit("plugins:updated");
                    });
                    container.once("unmounted", function() {
                        PluginsLoader.plugins = _.filter(PluginsLoader.plugins, (o) => o.plugin.name !== plugin.name);
                        debug("plugins")("Plugin %s fully unmounted and free", plugin.name);
                    });
                    container.once("unexpectedErrorState", function(err) {
                        self.logger.error("An unexpected error happened when unmounting plugin %s. System will shutdown.", plugin.name, err);
                        self.system.shutdown();
                    });

                    container.beforeMount(function() {
                        return self
                            .synchronize(plugin, {forceSynchronize: options.forceSynchronize})
                            .then(function() {
                                container.reloadInstance();
                                return Promise.resolve();
                            });
                    });

                    container.beforeUnmount(function() {
                        // stop all scenarios that use the plugin
                        let scenariosToStop = scenarioHelper.getScenariosId(container.plugin);
                        debug("plugins:loader")("Stopping all scenarios of %s before unmount (%s)", plugin.name, scenariosToStop);
                        return Promise
                            .map(scenariosToStop, function(id: string) {
                                return self.system.scenarioReader.stopScenario(id, {silent: true});
                            });
                    });

                    return container;
                }
            })
            .then(function(container: PluginContainer) {
                // mount the container
                return container.mount()
                    .catch(function(err) {
                        // This is a very important part
                        // always waiting for the current container to mount in any case and catch the unableToRemount allow us to handle case
                        // loader.mount(pluginA) -> container
                        //      container.unmount() ...
                        //      loader.mount(pluginA) ... (the previous container still exist and is unmounting)
                        //      container.unmount() done! (the container is unmounted and should be removed)
                        //      loader.mount(pluginA) ... now we have container.mount() catch with error unableToRemount
                        //          -> loader.mount(pluginA) is called inside same function and returned as result with a new container
                        //      loader.mount(pluginA) -> container (new container)
                        // It's always possible to make loader.mount(myPlugin) and have success on promise and have either current valid container or a new one
                        if (err.code === "unableToRemount") {
                            return self.mount(plugin, options);
                        }
                        throw err;
                    });
            });
    }

    // public unmount(name: string) {
    //     let self = this;
    //     assert.isString(name);
    //
    //     let semaphore = PluginsLoader.getSemaphoreFor(name);
    //     let pluginContainer = PluginsLoader.plugins.find((container) => container.plugin.name === name);
    //
    //     debug("plugins:loader")("UnMount demand for plugin %s", name);
    //
    //     // the plugin is not mounted
    //     if (!pluginContainer) {
    //         return Promise.reject(new SystemError(name + " not found", SystemError.ERROR_CODE_PLUGIN_NOT_FOUNT));
    //     }
    //
    //     // not mounted anymore
    //     pluginContainer.state = null;
    //
    //     // Start unmount process
    //     return new Promise(function(resolve, reject) {
    //         semaphore.take(function() {
    //             // stop all scenarios that use the plugin
    //             let scenariosToStop = scenarioHelper.getScenariosId(pluginContainer.plugin);
    //             debug("plugins:loader")("Stopping all scenarios of %s before unmount (%s)", name, scenariosToStop);
    //             Promise
    //                 .map(scenariosToStop, function(id: string) {
    //                     return self.system.scenarioReader.stopScenario(id, {silent: true});
    //                 })
    //                 .then(function() {
    //                     // unmount plugin instance
    //                     pluginContainer.instance.unmount(function() {
    //                         // remove item from list
    //                         PluginsLoader.plugins = _.filter(PluginsLoader.plugins, (o) => o.plugin.name !== name);
    //                         self.system.emit("plugins:updated");
    //                         self.logger.verbose("Plugin %s has been unmount and all its scenarios stopped", name);
    //                         semaphore.leave();
    //                         return resolve();
    //                     });
    //                 })
    //                 .catch(reject);
    //         });
    //     });
    // }

    // public getPluginInfo(name) {
    //     return this.loadPackageFile(path.resolve(this.system.config.synchronizedPluginsPath, name));
    // }

    /**
     * Try to load js package file and then try json.
     * @param moduleDirFullPath
     */
    public loadPackageFile(moduleDirFullPath) {
        let packageJSONPath = path.join(moduleDirFullPath, PluginsLoader.PACKAGE_FILE_NAME_JSON);
        debug("plugins")("Load package file at %s", packageJSONPath);
        // invalidate cache. We need this to ensure always having fresh info instead of the same "moduleInfo" var which may be changed further.
        // also the plugin may be changed during runtime this way.
        // first try to load js
        let data = require(packageJSONPath);
        decache(require.resolve(packageJSONPath));

        return data;
    }

    /**
     * Useful to test if a plugin is loaded
     */
    public getPluginContainerByName(pluginName): PluginContainer {
        return PluginsLoader.plugins.find((container) => container.plugin.name === pluginName)
    }

    /**
     * Synchronize if needed a plugin
     * @param plugin
     * @param options
     */
    public synchronize(plugin: Plugin, options: any) {
        let self = this;
        // return Promise.reject("df");
        options = _.merge({forceSynchronize: false}, options);
        // first check if plugin is synchronized
        return this.system.repository
            .pluginExist(plugin)
            // Synchronize if needed
            .then(function(pluginStats) {
                if (options.forceSynchronize) {
                    self.logger.verbose("Force plugin %s to synchronize. Synchronizing..", plugin.name);
                } else if (!pluginStats.exist || !pluginStats.isValid) {
                    self.logger.verbose("Plugin %s does not seems to be synchronizing yet. Synchronizing..", plugin.name);
                }
                if (options.forceSynchronize || !pluginStats.exist || !pluginStats.isValid) {
                    return self.system.repository.synchronize(plugin)
                        .then(function(dir) {
                            debug("plugins")("%s has been synchronized to %s", plugin.name, dir);
                            return dir;
                        });
                } else {
                    self.logger.verbose("Plugin %s is already synchronized.", plugin.name);
                }
            });
    }

    /**
     * Either get current semaphore or create a new one if semaphore has not be created yet or cleaned.
     * We use semaphore of 1 which could also be a simple queue.
     * @param pluginName
     * @returns {any}
     */
    // protected static getSemaphoreFor(pluginName) {
    //     let semaphore = PluginsLoader.semaphores[pluginName];
    //     if (!semaphore) {
    //         debug("plugins")("Register a new semaphore for plugin %s", pluginName);
    //         semaphore = Semaphore(1);
    //         PluginsLoader.semaphores[pluginName] = semaphore;
    //     }
    //     return semaphore;
    // }
}


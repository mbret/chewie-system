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
    // protected static semaphores: any = {};
    protected static plugins: Array<PluginContainer> = [];

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('PluginsLoader');

        // register clean up task
        this.system.garbageCollector.registerTask(() => {
            // task for cleanup semaphore and avoid having semaphores collection growing up as
            // the plugins grow up. Every new plugin mounted create a new entry in semaphore collection and may become
            // very huge after long execution time.
            // _.forEach(_.clone(PluginsLoader.semaphores), function(semaphore, pluginName) {
            //     // semaphore is empty we can remove it
            //     if (semaphore.queue.length === 0) {
            //         debug("plugins")("Semaphore for plugin %s is not active anymore and has been cleaned", pluginName);
            //         delete PluginsLoader.semaphores[pluginName];
            //     }
            // });
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
        let container: PluginContainer = null;

        options = _.merge({forceSynchronize: this.system.config.alwaysSynchronizePlugins}, options);

        if (!(plugin instanceof Object)) {
            throw new Error("plugin must be an instance of plugin model. " + typeof plugin + " given!");
        }

        debug("plugins")("Mount demand for plugin %s", plugin.name);

        return Promise.resolve()
            .then(function() {
                // create container or retrieve existing
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
                        // This is a very important part:
                        // We always wait for the current existing container to mount and catch the unableToRemount when this container is unmounting for example.
                        // It allow us to handle this case:
                        //
                        // loader.mount(pluginA) -> container (We have a new container which is mounting)
                        //      container.unmount() ... (we ask for this container to unmount)
                        //      loader.mount(pluginA) ... (we ask for a new plugin (the same) to mount. The previous container still exist and is unmounting)
                        //      container.unmount() has been done! (the container is unmounted and should be removed from repository)
                        //      loader.mount(pluginA) ... (now we should get a container.mount() exception with error unableToRemount)
                        //          -> loader.mount(pluginA) called by this method (This is the specific part. We return the a container as the previous one has been removed)
                        //      loader.mount(pluginA) -> container (new container received and mounted)
                        //
                        // It's always possible to make loader.mount(myPlugin) and have success on promise and have either current valid container or a new one
                        if (err.code === "unableToRemount") {
                            return self.mount(plugin, options);
                        }
                        throw err;
                    });
            });
    }

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
}


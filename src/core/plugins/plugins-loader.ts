"use strict";

import * as _ from "lodash";
import * as path from "path"
import {PluginHelper} from "./plugin-helper";
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
     * @returns {any}
     */
    public mount(plugin: Plugin) {
        let self = this;

        if (!(plugin instanceof Object)) {
            throw new Error("plugin must be an instance of plugin model. " + typeof plugin + " given!");
        }

        debug("plugins")("Mount demand for plugin %s", plugin.name);

        let semaphore = PluginsLoader.getSemaphoreFor(plugin.name);

        return new Promise(function(resolve, reject) {
            semaphore.take(function() {
                // fetch current mounted container
                let container = PluginsLoader.plugins.find((container) => container.plugin.name === plugin.name);

                // for now an unmounted plugin should not exist in the list so we consider it's still running if it exist
                if (container) {
                    semaphore.leave();
                    return reject(new SystemError("Plugin " + plugin.name + " already loaded. Trying to load a plugin while it has already be loaded", SystemError.ERROR_CODE_PLUGIN_ALREADY_MOUNTED))
                }

                // ok we mount the plugin
                // first check if plugin is synchronized
                self
                    .synchronize(plugin)
                    // Once synchronized we can load the plugin
                    .then(function() {
                        // create container
                        let container = new PluginContainer(self.system, plugin, null);
                        let helper = new PluginHelper(self.system, container);

                        // require the class export of plugin & create the instance
                        // also in case of missing attribute we merge it with DefaultPluginInstance that contains everything needed
                        let pluginInstance = self.getPluginClass(plugin);
                        pluginInstance.mount = pluginInstance.mount || ((helper, done) => done() );
                        pluginInstance.unmount = pluginInstance.unmount || ((helper, done) => done() );

                        // we attach instance to container to work with it later
                        container.instance = pluginInstance;

                        // add to global storage
                        PluginsLoader.plugins.push(container);

                        // mount plugin instance
                        return new Promise(function(resolve, reject) {
                            pluginInstance.mount(helper, function(err) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve();
                            });
                        });
                    })
                    .then(function() {
                        debug("plugins")("Plugin %s fully mounted and ready", plugin.name);
                        self.system.emit("plugins:updated");
                        semaphore.leave();
                        return resolve(container);
                    })
                    .catch(function(err) {
                        // mount failed, just cancel everything
                        PluginsLoader.plugins = _.filter(PluginsLoader.plugins, (o) => o.plugin.name !== plugin.name);
                        semaphore.leave();
                        return reject(err);
                    });
            });
        });
    }

    public unmount(name: string) {
        let self = this;
        let scenarioHelper = new ScenarioHelper(this.system);
        assert.isString(name);

        let semaphore = PluginsLoader.getSemaphoreFor(name);
        let pluginContainer = PluginsLoader.plugins.find((container) => container.plugin.name === name);

        debug("plugins:loader")("UnMount demand for plugin %s", name);

        // the plugin is not mounted
        if (!pluginContainer) {
            return Promise.reject(new SystemError(name + " not found", SystemError.ERROR_CODE_PLUGIN_NOT_FOUNT));
        }

        // Start unmount process
        return new Promise(function(resolve, reject) {
            semaphore.take(function() {
                // stop all scenarios tha use the plugin
                let scenariosToStop = scenarioHelper.getScenariosId(pluginContainer.plugin);
                debug("plugins:loader")("Stopping all scenarios of %s before unmount (%s)", name, scenariosToStop);
                Promise
                    .map(scenariosToStop, function(id: string) {
                        return self.system.scenarioReader.stopScenario(id, {silent: true});
                    })
                    .then(function() {
                        // unmount plugin instance
                        pluginContainer.instance.unmount(function() {
                            // remove item from list
                            PluginsLoader.plugins = _.filter(PluginsLoader.plugins, (o) => o.plugin.name !== name);
                            self.system.emit("plugins:updated");
                            self.logger.debug.verbose("Plugin %s has been unmount and all its scenarios stopped", name);
                            semaphore.leave();
                            return resolve();
                        });
                    })
                    .catch(reject);
            });
        });
    }

    /**
     *
     * @param name
     */
    public getPluginInfo(name) {
        return this.loadPackageFile(path.resolve(this.system.config.synchronizedPluginsPath, name));
    }

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
    public getPluginContainerByName(pluginName) {
        return PluginsLoader.plugins.find((container) => container.plugin.name === pluginName)
    }

    /**
     * Synchronize if needed a plugin
     * @param plugin
     */
    protected synchronize(plugin: Plugin) {
        let self = this;
        // first check if plugin is synchronized
        return this.system.repository
            .pluginExist(plugin)
            // Synchronize if needed
            .then(function(pluginStats) {
                if (self.system.config.forcePluginsSynchronizeAtStartup) {
                    self.logger.verbose("Force plugin %s to synchronize. Synchronizing..", plugin.name);
                } else if (!pluginStats.exist || !pluginStats.isValid) {
                    self.logger.verbose("Plugin %s does not seems to be synchronizing yet. Synchronizing..", plugin.name);
                }
                if (self.system.config.forcePluginsSynchronizeAtStartup || !pluginStats.exist || !pluginStats.isValid) {
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
     *
     * @param plugin
     */
    protected getPluginClass(plugin: Plugin) {
        if (!plugin.package.main) {
            return {};
        }

        // get module instance path
        let pluginAbsolutePath = path.resolve(this.system.config.synchronizedPluginsPath, plugin.name);
        let modulePath = path.resolve(pluginAbsolutePath, plugin.package.main);

        debug("plugins")("plugin instance path is %s", modulePath);

        // now require the module
        return require(modulePath);
    }

    /**
     * Either get current semaphore or create a new one if semaphore has not be created yet or cleaned.
     * We use semaphore of 1 which could also be a simple queue.
     * @param pluginName
     * @returns {any}
     */
    protected static getSemaphoreFor(pluginName) {
        let semaphore = PluginsLoader.semaphores[pluginName];
        if (!semaphore) {
            debug("plugins")("Register a new semaphore for plugin %s", pluginName);
            semaphore = Semaphore(1);
            PluginsLoader.semaphores[pluginName] = semaphore;
        }
        return semaphore;
    }
}


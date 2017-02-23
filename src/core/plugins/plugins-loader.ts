"use strict";

import * as _ from "lodash";
import * as path from "path"
import {PluginHelper} from "./plugin-helper";
import {PluginContainer} from "./plugin-container";
import {System} from "../../system";
import {SystemError} from "../error";
import {DefaultPluginInstance} from "./default-plugin-instance";
const util = require("util");
const Semaphore = require('semaphore');
import {debug} from "../../shared/debug";
let assert = require("chai").assert;
let decache = require('decache');

export class PluginsLoader {

    static PACKAGE_FILE_NAME = "chewie.package.js";
    static PACKAGE_FILE_NAME_JSON = "chewie.package.json";

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

                        // add to global storage
                        PluginsLoader.plugins.push(container);

                        // require the class export of plugin & create the instance
                        // also in case of missing attribute we merge it with DefaultPluginInstance that contains everything needed
                        let PluginClass = self.getPluginClass(plugin);
                        let instance = _.assign(new DefaultPluginInstance(helper), new PluginClass(helper));

                        // we attach instance to container to work with it later
                        container.instance = instance;

                        // mount plugin instance
                        instance.mount(function(err) {
                            if (err) {
                                return Promise.reject(err);
                            }
                            return Promise.resolve();
                        });
                    })
                    .then(function() {
                        self.system.emit("plugins:updated");
                        semaphore.leave();
                        return resolve(container);
                    })
                    .catch(function(err) {
                        // mount failed, just cancel everything
                        PluginsLoader.plugins = _.filter(PluginsLoader.plugins, (o) => o.plugin.name !== plugin.name);
                        self.system.plugins.delete(plugin.name);
                        semaphore.leave();
                        return reject(err);
                    });
            });
        });
    }

    public unMount(name: string) {
        let self = this;

        assert.isString(name);

        let semaphore = PluginsLoader.getSemaphoreFor(name);
        let pluginContainer = PluginsLoader.plugins.find((container) => container.plugin.name === name);

        debug("plugins")("UnMount demand for plugin %s", name);

        // the plugin is not mounted
        if (!pluginContainer) {
            return Promise.reject(new SystemError(name + " not found", SystemError.ERROR_CODE_PLUGIN_NOT_FOUNT));
        }

        // Start unMount process
        return new Promise(function(resolve) {
            semaphore.take(function() {
                pluginContainer.instance.unMount(function() {
                    // remove item from list
                    PluginsLoader.plugins = _.filter(PluginsLoader.plugins, (o) => o.plugin.name !== name);
                    self.system.emit("plugins:updated");
                    semaphore.leave();
                    return resolve();
                });
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
        let self = this;
        let data = null;
        let packageJsPath = path.join(moduleDirFullPath, PluginsLoader.PACKAGE_FILE_NAME);
        let packageJSONPath = path.join(moduleDirFullPath, PluginsLoader.PACKAGE_FILE_NAME_JSON);
        debug("plugins")("Load package file for possible path [%s, %s]", packageJsPath, packageJSONPath);
        // invalidate cache. We need this to ensure always having fresh info instead of the same "moduleInfo" var which may be changed further.
        // also the plugin may be changed during runtime this way.
        // first try to load js
        try {
            data = require(packageJsPath);
            decache(require.resolve(packageJsPath));
            // delete require.cache[require.resolve(packageJsPath)];
        } catch (err) {
            // then try the json
            if (err.code === "MODULE_NOT_FOUND") {
                data = require(packageJSONPath);
                decache(require.resolve(packageJSONPath));
            } else {
                throw err;
            }
        }

        return data;
    }

    /**
     * Synchronize if needed a plugin
     * @param plugin
     */
    protected synchronize(plugin: Plugin) {
        let self = this;
        // first check if plugin is synchronized
        return this.system.repository
            .pluginExist(plugin.name)
            // Synchronize if needed
            .then(function(pluginStats) {
                if (self.system.config.forcePluginsSynchronizeAtStartup) {
                    self.logger.verbose("Force plugin %s to synchronize. Synchronizing..", plugin.name);
                }
                if (!pluginStats.exist || !pluginStats.isValid) {
                    self.logger.verbose("Plugin %s does not seems to be synchronizing yet. Synchronizing..", plugin.name);
                }
                if (self.system.config.forcePluginsSynchronizeAtStartup || !pluginStats.exist || !pluginStats.isValid) {
                    debug("plugins")("%s has been synchronized", plugin.name);
                    return self.system.repository.synchronize([plugin]);
                }
            });
    }

    /**
     *
     * @param plugin
     */
    protected getPluginClass(plugin: any) {
        plugin.package = this.getPluginInfo(plugin.name);

        if (!plugin.package.pluginInstance) {
            return DefaultPluginInstance;
        }

        // get module instance path
        let modulePath = plugin.package.pluginInstance;
        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
        // ./module will become D://foo/bar/plugins/module
        if (!path.isAbsolute(modulePath)) {
            let pluginAbsolutePath = path.resolve(this.system.config.synchronizedPluginsPath, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }

        this.logger.debug("plugin path %s", modulePath);

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


"use strict";

import * as path from "path"
import {PluginHelper} from "./plugin-helper";
import {PluginContainer} from "./plugin-container";
import {System} from "../../system";
import {SystemError} from "../error";

export class PluginsLoader {

    system: System;
    logger: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginsLoader');
    }

    load(plugin: Plugin) {
        let self = this;

        // avoid read same scenario in same time
        if (this.system.runtime.plugins.get(plugin.name)) {
            return Promise.reject(new SystemError("Plugin " + plugin.name + " already loaded. Trying to load a plugin while it has already be loaded", SystemError.ERROR_CODE_ALREADY_RUNNING));
        }

        // create container
        let container = new PluginContainer(self.system, plugin, null);
        let helper = new PluginHelper(self.system, container);

        // add to global storage
        self.system.runtime.plugins.set(plugin.name, container);

        return new Promise(function(resolve, reject) {
            let PluginInstance = self.getPluginInstance(plugin);
            let instance = new PluginInstance();

            container.instance = instance;

            // run plugin bootstrap
            instance.onLoad(helper, function(err) {
                if (err) {
                    self.system.runtime.plugins.delete(plugin.name);
                    self.system.emit("plugins:updated");
                    return reject(err);
                } else {
                    self.system.emit("plugins:updated");
                    return resolve(container);
                }
            });
        });
    }

    unLoad(plugin: Plugin) {
        let self = this;
        let pluginContainer = self.system.runtime.plugins.get(plugin.name);
        self.system.runtime.plugins.delete(plugin.name);
        self.system.emit("plugins:updated");
        return new Promise(function(resolve) {
            pluginContainer.instance.onStop(function() {
                return resolve();
            });
        });
    }

    isPluginLoaded(plugin: Plugin) {
        return this.system.runtime.plugins.get(plugin.name);
    }

    /**
     *
     * @param plugin
     */
    getPluginInstance(plugin: any) {
        plugin.package = this.getPluginInfo(plugin.name);

        if (!plugin.package.pluginInstance) {
            return DefaultPluginInstance;
        }

        // get module instance path
        let modulePath = plugin.package.pluginInstance;
        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
        // ./module will become D://foo/bar/plugins/module
        if (!path.isAbsolute(modulePath)) {
            let pluginAbsolutePath = path.resolve(this.system.config.system.synchronizedPluginsDir, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }

        this.logger.debug("plugin path %s", modulePath);

        // now require the module
        return require(modulePath);
    }

    /**
     *
     * @param name
     */
    getPluginInfo(name) {
        return this.system.localRepository.loadPackageFile(path.resolve(this.system.config.system.synchronizedPluginsDir, name));
    }
}

export interface PluginInstance {
    onLoad(helper, cb);
    onStop(cb);
}

export class DefaultPluginInstance implements PluginInstance {
    onLoad(helper, cb) {
        return cb();
    }
    onStop(cb) {
        return cb();
    }
}
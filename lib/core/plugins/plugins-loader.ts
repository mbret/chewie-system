"use strict";

import * as _ from "lodash";
import * as path from "path"
import {PluginHelper} from "./plugin-helper";
import {PluginContainer} from "./plugin-container";
import {System} from "../../system";
import defaultBootstrap from "./plugin-default-bootstrap";

export class PluginsLoader {

    system: System;
    logger: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginsLoader');
    }

    load(plugin: any) {
        let self = this;
        return new Promise(function(resolve, reject) {
            let pluginBootstrap = self.getPluginBootstrap(plugin);

            // create container
            let container = new PluginContainer(self.system, plugin, null);

            let helper = new PluginHelper(self.system, container);
            // run plugin bootstrap
            pluginBootstrap(helper, function(err) {
                if (err) {
                    return reject(err);
                }
                // add to global storage
                self.system.runtime.plugins.set(container.plugin.name, container);
                return resolve(container);
            });
        });
    }

    /**
     *
     * @param plugin
     * @returns {any}
     */
    getPluginBootstrap(plugin: any) {
        plugin.package = this.getPluginInfo(plugin.name);

        if (!plugin.package.bootstrap) {
            return defaultBootstrap;
        }

        // get module instance path
        let modulePath = plugin.package.bootstrap;
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
        return require(path.resolve(this.system.config.system.synchronizedPluginsDir, name, "plugin-package"));
    }
}
"use strict";

import * as _ from "lodash";
import * as path from "path"
import {PluginHelper} from "./plugin-helper";
import {PluginContainer} from "./plugin-container";
import {Daemon} from "../../daemon";
import defaultBootstrap from "./plugin-default-bootstrap";

export class PluginLoader {

    system: Daemon;
    logger: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginLoader');
    }

    load(plugin: any) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var pluginBootstrap = self.getPluginBootstrap(plugin);

            // create container
            var container = new PluginContainer(self.system, plugin, null);

            var helper = new PluginHelper(self.system, container);
            // run plugin bootstrap
            pluginBootstrap(helper, function(err) {
                if (err) {
                    return reject(err);
                }
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
        if (!plugin.config.bootstrap) {
            return defaultBootstrap;
        }

        // get module instance path
        var modulePath = plugin.config.bootstrap;
        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
        // ./module will become D://foo/bar/plugins/module
        if (!path.isAbsolute(modulePath)) {
            var pluginAbsolutePath = path.resolve(this.system.config.system.synchronizedPluginsDir, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }

        this.logger.debug("plugin path %s", modulePath);

        // now require the module
        return require(modulePath);
    }
}
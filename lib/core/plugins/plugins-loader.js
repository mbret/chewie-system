"use strict";
const path = require("path");
const plugin_helper_1 = require("./plugin-helper");
const plugin_container_1 = require("./plugin-container");
const plugin_default_bootstrap_1 = require("./plugin-default-bootstrap");
class PluginsLoader {
    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginsLoader');
    }
    load(plugin) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var pluginBootstrap = self.getPluginBootstrap(plugin);
            var container = new plugin_container_1.PluginContainer(self.system, plugin, null);
            var helper = new plugin_helper_1.PluginHelper(self.system, container);
            pluginBootstrap(helper, function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve(container);
            });
        });
    }
    getPluginBootstrap(plugin) {
        plugin.package = this.getPluginInfo(plugin.name);
        if (!plugin.package.bootstrap) {
            return plugin_default_bootstrap_1.default;
        }
        let modulePath = plugin.package.bootstrap;
        if (!path.isAbsolute(modulePath)) {
            let pluginAbsolutePath = path.resolve(this.system.config.system.synchronizedPluginsDir, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }
        this.logger.debug("plugin path %s", modulePath);
        return require(modulePath);
    }
    getPluginInfo(name) {
        return require(path.resolve(this.system.config.system.synchronizedPluginsDir, name, "plugin-package"));
    }
}
exports.PluginsLoader = PluginsLoader;

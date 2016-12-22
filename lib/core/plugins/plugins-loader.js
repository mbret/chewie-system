"use strict";
var path = require("path");
var plugin_helper_1 = require("./plugin-helper");
var plugin_container_1 = require("./plugin-container");
var plugin_default_bootstrap_1 = require("./plugin-default-bootstrap");
var PluginsLoader = (function () {
    function PluginsLoader(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginsLoader');
    }
    PluginsLoader.prototype.load = function (plugin) {
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
    };
    PluginsLoader.prototype.getPluginBootstrap = function (plugin) {
        plugin.package = this.getPluginInfo(plugin.name);
        if (!plugin.package.bootstrap) {
            return plugin_default_bootstrap_1.default;
        }
        var modulePath = plugin.package.bootstrap;
        if (!path.isAbsolute(modulePath)) {
            var pluginAbsolutePath = path.resolve(this.system.config.system.synchronizedPluginsDir, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }
        this.logger.debug("plugin path %s", modulePath);
        return require(modulePath);
    };
    PluginsLoader.prototype.getPluginInfo = function (name) {
        return require(path.resolve(this.system.config.system.synchronizedPluginsDir, name, "plugin-package"));
    };
    return PluginsLoader;
}());
exports.PluginsLoader = PluginsLoader;

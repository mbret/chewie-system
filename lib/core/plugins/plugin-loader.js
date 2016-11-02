"use strict";
var path = require("path");
var plugin_helper_1 = require("./plugin-helper");
var plugin_container_1 = require("./plugin-container");
var plugin_default_bootstrap_1 = require("./plugin-default-bootstrap");
var PluginLoader = (function () {
    function PluginLoader(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginLoader');
    }
    PluginLoader.prototype.load = function (plugin) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var pluginBootstrap = self.getPluginBootstrap(plugin);
            // create container
            var container = new plugin_container_1.PluginContainer(self.system, plugin, null);
            var helper = new plugin_helper_1.PluginHelper(self.system, container);
            // run plugin bootstrap
            pluginBootstrap(helper, function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve(container);
            });
        });
    };
    /**
     *
     * @param plugin
     * @returns {any}
     */
    PluginLoader.prototype.getPluginBootstrap = function (plugin) {
        if (!plugin.package.bootstrap) {
            return plugin_default_bootstrap_1.default;
        }
        // get module instance path
        var modulePath = plugin.package.bootstrap;
        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
        // ./module will become D://foo/bar/plugins/module
        if (!path.isAbsolute(modulePath)) {
            var pluginAbsolutePath = path.resolve(this.system.config.system.synchronizedPluginsDir, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }
        this.logger.debug("plugin path %s", modulePath);
        // now require the module
        return require(modulePath);
    };
    return PluginLoader;
}());
exports.PluginLoader = PluginLoader;

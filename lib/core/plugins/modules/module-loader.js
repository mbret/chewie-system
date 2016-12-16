"use strict";
var _ = require("lodash");
var path = require("path");
var module_helper_1 = require("./module-helper");
var module_container_1 = require("./module-container");
var ModuleLoader = (function () {
    function ModuleLoader(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleLoader');
    }
    ModuleLoader.prototype.loadModule = function (plugin, moduleId) {
        // get module info
        var moduleInfo = _.find(plugin.package.modules, function (module) {
            return module.id === moduleId;
        });
        // get module instance path
        var modulePath = moduleInfo.module;
        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
        // ./module will become D://foo/bar/plugins/module
        if (!path.isAbsolute(modulePath)) {
            var pluginAbsolutePath = path.resolve(this.system.config.system.synchronizedPluginsDir, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }
        // create container
        var container = new module_container_1.ModuleContainer(this.system, this.system.runtime.plugins.get(plugin.name), moduleInfo, null);
        // now require the module
        var Module = require(modulePath);
        var helper = new module_helper_1.ModuleHelper(this.system, container);
        container.instance = new Module(helper, moduleInfo);
        return Promise.resolve(container);
    };
    return ModuleLoader;
}());
exports.ModuleLoader = ModuleLoader;

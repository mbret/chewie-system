"use strict";
const _ = require("lodash");
const path = require("path");
const module_helper_1 = require("./module-helper");
const module_container_1 = require("./module-container");
class ModuleLoader {
    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ModuleLoader');
        this.synchronizedPluginsPath = path.join(this.system.config.system.appDataPath, this.system.config.system.synchronizedPluginsDir);
    }
    loadModule(plugin, moduleId) {
        let moduleInfo = _.find(plugin.package.modules, function (module) {
            return module.id === moduleId;
        });
        let modulePath = moduleInfo.module;
        if (!path.isAbsolute(modulePath)) {
            let pluginAbsolutePath = path.resolve(this.synchronizedPluginsPath, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }
        let container = new module_container_1.ModuleContainer(this.system, this.system.runtime.plugins.get(plugin.name), moduleInfo, null);
        let Module = require(modulePath);
        Module.prototype.stop = Module.prototype.stop || function () { };
        let helper = new module_helper_1.ModuleHelper(this.system, container);
        container.instance = new Module(helper, moduleInfo);
        return Promise.resolve(container);
    }
}
exports.ModuleLoader = ModuleLoader;
//# sourceMappingURL=module-loader.js.map
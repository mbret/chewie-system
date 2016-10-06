"use strict";
var ModuleContainer = (function () {
    function ModuleContainer(system, plugin, moduleInfo, instance) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleContainer');
        this.uniqueId = this.getModuleUniqueId(plugin.id, moduleInfo.id);
        this.instance = instance;
        this.plugin = plugin;
        this.module = moduleInfo;
    }
    ModuleContainer.prototype.getModuleUniqueId = function (pluginId, moduleId) {
        return pluginId + ":" + moduleId;
    };
    return ModuleContainer;
}());
exports.ModuleContainer = ModuleContainer;

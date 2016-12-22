"use strict";
class ModuleContainer {
    constructor(system, pluginContainer, moduleInfo, instance) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleContainer');
        this.uniqueId = ModuleContainer.getModuleUniqueId(pluginContainer.plugin.name, moduleInfo.id);
        this.id = this.uniqueId;
        this.instance = instance;
        this.pluginContainer = pluginContainer;
        this.module = moduleInfo;
    }
    static getModuleUniqueId(pluginId, moduleId) {
        return pluginId + ":" + moduleId;
    }
}
exports.ModuleContainer = ModuleContainer;

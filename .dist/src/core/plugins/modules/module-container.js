"use strict";
class ModuleContainer {
    constructor(system, pluginContainer, moduleInfo, instance) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ModuleContainer');
        this.uniqueId = ModuleContainer.getModuleUniqueId(pluginContainer.plugin.name, moduleInfo.id);
        this.id = this.uniqueId;
        this.instance = instance;
        this.pluginContainer = pluginContainer;
        this.module = moduleInfo;
        this.stopped = false;
    }
    static getModuleUniqueId(pluginId, moduleId) {
        return pluginId + ":" + moduleId;
    }
    stopInstance() {
        this.stopped = true;
        return this.instance.stop();
    }
}
exports.ModuleContainer = ModuleContainer;
//# sourceMappingURL=module-container.js.map
"use strict";
// import * as uuid from "node-uuid";
var ModuleContainer = (function () {
    function ModuleContainer(system, pluginContainer, moduleInfo, instance) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleContainer');
        this.uniqueId = ModuleContainer.getModuleUniqueId(pluginContainer.plugin.name, moduleInfo.id);
        // runtime id
        // this.id = uuid.v4();
        this.id = this.uniqueId;
        this.instance = instance;
        this.pluginContainer = pluginContainer;
        this.module = moduleInfo;
    }
    ModuleContainer.getModuleUniqueId = function (pluginId, moduleId) {
        return pluginId + ":" + moduleId;
    };
    return ModuleContainer;
}());
exports.ModuleContainer = ModuleContainer;

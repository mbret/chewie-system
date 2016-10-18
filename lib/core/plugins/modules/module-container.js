"use strict";
var uuid = require("node-uuid");
var ModuleContainer = (function () {
    function ModuleContainer(system, pluginContainer, moduleInfo, instance) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleContainer');
        this.uniqueId = this.getModuleUniqueId(pluginContainer.plugin.id, moduleInfo.id);
        // runtime id
        this.id = uuid.v4();
        this.instance = instance;
        this.pluginContainer = pluginContainer;
        this.module = moduleInfo;
    }
    ModuleContainer.prototype.getModuleUniqueId = function (pluginId, moduleId) {
        return pluginId + ":" + moduleId;
    };
    return ModuleContainer;
}());
exports.ModuleContainer = ModuleContainer;

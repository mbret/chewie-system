"use strict";
var ModuleHelper = (function () {
    function ModuleHelper(system, moduleInfo) {
        this.system = system;
        this.moduleInfo = moduleInfo;
        this.logger = this.system.logger.Logger.getLogger('ModuleHelper');
    }
    ModuleHelper.prototype.getActiveTasksFromMyPlugin = function () {
        var modules = this.system.modules.get(this.moduleInfo.plugin.id + ":" + this.moduleInfo.id);
    };
    return ModuleHelper;
}());
exports.ModuleHelper = ModuleHelper;

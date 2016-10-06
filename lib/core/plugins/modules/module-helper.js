"use strict";
var self = this;
var ModuleHelper = (function () {
    function ModuleHelper(system, moduleContainer) {
        self = this;
        this.system = system;
        this.moduleContainer = moduleContainer;
        this.logger = this.system.logger.Logger.getLogger('ModuleHelper');
    }
    /**
     * Return only task modules for the current plugin.
     * @returns {Array}
     */
    ModuleHelper.prototype.getActiveTasksFromMyPlugin = function () {
        var modules = [];
        this.system.modules.forEach(function (container) {
            if (container.plugin.id === self.moduleContainer.plugin.id && container.module.type === "task") {
                modules.push(container.instance);
            }
        });
        return modules;
    };
    return ModuleHelper;
}());
exports.ModuleHelper = ModuleHelper;

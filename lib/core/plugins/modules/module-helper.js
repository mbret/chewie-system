"use strict";
var self = this;
class ModuleHelper {
    constructor(system, moduleContainer) {
        self = this;
        this.system = system;
        this.moduleContainer = moduleContainer;
        this.logger = this.system.logger.Logger.getLogger('ModuleHelper');
        this.shared = this.moduleContainer.pluginContainer.shared;
        this.id = moduleContainer.id;
    }
}
exports.ModuleHelper = ModuleHelper;

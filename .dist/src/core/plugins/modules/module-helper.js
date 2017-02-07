"use strict";
let self = this;
class ModuleHelper {
    constructor(system, moduleContainer) {
        self = this;
        this.system = system;
        this.moduleContainer = moduleContainer;
        this.logger = this.system.logger.getLogger('ModuleHelper:' + this.moduleContainer.uniqueId);
        this.shared = this.moduleContainer.pluginContainer.shared;
        this.id = moduleContainer.id;
    }
}
exports.ModuleHelper = ModuleHelper;
//# sourceMappingURL=module-helper.js.map
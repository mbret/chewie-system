"use strict";
var ModuleLoader = (function () {
    function ModuleLoader(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleLoader');
    }
    ModuleLoader.prototype.loadModule = function (plugin, moduleId) {
    };
    return ModuleLoader;
})();
exports.ModuleLoader = ModuleLoader;

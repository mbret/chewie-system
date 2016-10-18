'use strict';
var PluginHelper = (function () {
    function PluginHelper(system, pluginContainer) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginHelper');
        this.pluginContainer = pluginContainer;
        this.shared = this.pluginContainer.shared;
    }
    return PluginHelper;
}());
exports.PluginHelper = PluginHelper;

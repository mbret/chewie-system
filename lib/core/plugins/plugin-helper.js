'use strict';
class PluginHelper {
    constructor(system, pluginContainer) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginHelper');
        this.pluginContainer = pluginContainer;
        this.shared = this.pluginContainer.shared;
    }
}
exports.PluginHelper = PluginHelper;

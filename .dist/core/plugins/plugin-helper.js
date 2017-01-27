'use strict';
class PluginHelper {
    constructor(system, pluginContainer) {
        this.system = system;
        this.logger = this.system.logger.getLogger('PluginHelper');
        this.pluginContainer = pluginContainer;
        this.shared = this.pluginContainer.shared;
    }
}
exports.PluginHelper = PluginHelper;
//# sourceMappingURL=plugin-helper.js.map
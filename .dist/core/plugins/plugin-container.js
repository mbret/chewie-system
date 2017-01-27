'use strict';
class PluginContainer {
    constructor(system, plugin, instance) {
        this.system = system;
        this.logger = this.system.logger.getLogger('PluginContainer');
        this.instance = instance;
        this.plugin = plugin;
        this.shared = {};
    }
}
exports.PluginContainer = PluginContainer;
//# sourceMappingURL=plugin-container.js.map
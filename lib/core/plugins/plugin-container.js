'use strict';
class PluginContainer {
    constructor(system, plugin, instance) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginContainer');
        this.plugin = plugin;
        this.shared = {};
    }
}
exports.PluginContainer = PluginContainer;

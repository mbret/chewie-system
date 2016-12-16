'use strict';
var PluginContainer = (function () {
    function PluginContainer(system, plugin, instance) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginContainer');
        //this.instance = instance;
        this.plugin = plugin;
        this.shared = {};
    }
    return PluginContainer;
}());
exports.PluginContainer = PluginContainer;

"use strict";
var ScenarioReader = (function () {
    function ScenarioReader(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ScenarioReader');
    }
    /**
     * Read a scenario from data
     * @param scenario
     */
    ScenarioReader.prototype.readScenario = function (scenario) {
        var self = this;
        this.logger.debug("Read scenario %s", scenario.id);
        // execute each node
        this.readNodes(scenario, scenario.nodes, { lvl: -1 });
        return Promise.resolve();
    };
    ScenarioReader.prototype.readNodes = function (scenario, nodes, options) {
        var self = this;
        nodes.forEach(function (node) {
            self.readNode(scenario, node, { lvl: options.lvl + 1 });
        });
    };
    ScenarioReader.prototype.readNode = function (scenario, node, options) {
        var self = this;
        if (node.type === "trigger") {
            self.readTriggerNode(scenario, node, options);
        }
        else if (node.type === "task") {
            self.readTaskNode(scenario, node, options);
        }
    };
    ScenarioReader.prototype.readTriggerNode = function (scenario, node, options) {
        var self = this;
        var plugin = null;
        return Promise
            .resolve(self.getModuleInstance(scenario.userId, node.pluginId, node.triggerId))
            .then(function (data) {
            self.logger.debug("Create a new demand for trigger module from plugin %s", data.plugin.id);
            data.moduleInstance.onNewDemand(node.options, onTrigger);
        })
            .catch(function (err) {
            self.logger.error("Unable to read scenario", err);
        });
        function onTrigger() {
            console.log("trigger execution", node.options, options);
            self.readNodes(scenario, node.nodes, options);
        }
    };
    ScenarioReader.prototype.readTaskNode = function (scenario, node, options) {
        var self = this;
        var plugin = null;
        return Promise
            .resolve(self.getModuleInstance(scenario.userId, node.pluginId, node.taskId))
            .then(function (data) {
            self.logger.debug("Create a new demand for task module from plugin %s", data.plugin.id, node.options);
            data.moduleInstance.onNewTask(node.options);
        })
            .catch(function (err) {
            self.logger.error("Unable to read scenario", err);
        });
    };
    ScenarioReader.prototype.getModuleInstance = function (userId, pluginId, moduleId) {
        var self = this;
        var plugin = null;
        return Promise
            .resolve()
            .then(function () {
            return self.system.apiService.findPlugin(userId, pluginId);
        })
            .then(function (data) {
            plugin = data;
            self.logger.debug("Load module instance from plugin %s", plugin.id);
            return self.system.moduleLoader.loadModule(plugin, moduleId);
        })
            .then(function (moduleInstance) {
            return {
                plugin: plugin,
                moduleInstance: moduleInstance
            };
        });
    };
    return ScenarioReader;
}());
exports.ScenarioReader = ScenarioReader;

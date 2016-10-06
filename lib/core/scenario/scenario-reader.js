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
        return this.readNodes(scenario, scenario.nodes, { lvl: -1 })
            .catch(function (err) {
            self.logger.error("An error occurred while reading scenario %s", scenario.name);
            throw err;
        });
    };
    ScenarioReader.prototype.readNodes = function (scenario, nodes, options) {
        var self = this;
        nodes.forEach(function (node) {
            self.readNode(scenario, node, { lvl: options.lvl + 1 });
        });
        return Promise.resolve();
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
            data.container.instance.onNewDemand(node.options, onTrigger);
        })
            .catch(function (err) {
            self.logger.error("An error occurred during scenario reading", err);
            throw err;
        });
        function onTrigger() {
            self.logger.debug("trigger execution", node.options, options);
            self.readNodes(scenario, node.nodes, options);
        }
    };
    ScenarioReader.prototype.readTaskNode = function (scenario, node, options) {
        var self = this;
        var plugin = null;
        return Promise
            .resolve(self.getModuleInstance(scenario.userId, node.pluginId, node.taskId))
            .then(function (data) {
            // add to global storage
            self.system.modules.set(data.container.uniqueId, data.container);
            self.logger.debug("Create a new demand for task module from plugin %s", data.plugin.id, node.options);
            data.container.instance.run(node.options, onTaskEnd);
            function onTaskEnd() {
                // remove from storage. At this point we do not have anymore reference of the instance in system
                // It's up to module to clean their stuff
                self.system.modules.delete(data.container.uniqueId);
                self.logger.debug("Task %s from plugin %s has been done and deleted from runtime storage", node.taskId, node.pluginId);
            }
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
            .then(function (moduleContainer) {
            return {
                plugin: plugin,
                container: moduleContainer
            };
        });
    };
    return ScenarioReader;
}());
exports.ScenarioReader = ScenarioReader;

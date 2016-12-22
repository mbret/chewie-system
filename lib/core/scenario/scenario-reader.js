"use strict";
const module_container_1 = require("../plugins/modules/module-container");
let self = null;
class ScenarioReader {
    constructor(system) {
        self = this;
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ScenarioReader');
    }
    readScenario(scenario) {
        let self = this;
        this.logger.debug("Read scenario %s", scenario.id);
        this.system.runtime.scenarios.set(scenario.id, scenario);
        return this
            .readNodes(scenario, scenario.nodes, { lvl: -1 })
            .then(function () {
            self.logger.debug("All nodes loaded, run the root nodes..");
            scenario.nodes.forEach(function (node) {
                let moduleId = module_container_1.ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
                let rtId = self.getRuntimeModuleKey(scenario.id, node.id, moduleId);
                let module = self.system.runtime.modules.get(rtId);
                if (node.type === "trigger") {
                    self.logger.debug("Create a new demand for trigger module from plugin %s", node.pluginId);
                    module.instance.onNewDemand(node.options, onTrigger.bind(self, scenario, node));
                }
                if (node.type === "task") {
                    self.logger.debug("Create a new demand for task module from plugin %s", node.pluginId, node.options);
                    module.instance.run(node.options, self.onTaskEnd.bind(self, scenario, node, module.uniqueId));
                }
            });
        })
            .catch(function (err) {
            self.logger.error("An error occurred while reading scenario %s", scenario.name, err);
            throw err;
        });
        function onTrigger(scenario, node) {
            self.logger.debug("trigger execution", node.options);
            self.logger.debug("Loop over sub nodes (-1) to ask new trigger demand");
            node.nodes.forEach(function (subNode) {
                let moduleUniqueId = module_container_1.ModuleContainer.getModuleUniqueId(subNode.pluginId, subNode.moduleId);
                let runtimeModuleContainer = self.system.runtime.modules.get(self.getRuntimeModuleKey(scenario.id, subNode.id, moduleUniqueId));
                if (subNode.type === "trigger") {
                    self.logger.debug("Create a new demand for trigger module from plugin %s", subNode.pluginId);
                    runtimeModuleContainer.instance.onNewDemand(subNode.options, onTrigger.bind(self, scenario, subNode));
                }
                if (subNode.type === "task") {
                    self.logger.debug("Create a new demand for task module from plugin %s", subNode.pluginId, subNode.options);
                    runtimeModuleContainer.instance.run(subNode.options, self.onTaskEnd.bind(self, scenario, subNode, runtimeModuleContainer.uniqueId));
                }
            });
        }
    }
    stopScenario(id) {
        let scenario = this.system.runtime.scenarios.get(id);
        this.system.runtime.scenarios.delete(id);
        return this.stopNodes(scenario, scenario.nodes);
    }
    readNodes(scenario, nodes, options) {
        let promises = [];
        nodes.forEach(function (node) {
            promises.push(self.readNode(scenario, node, { lvl: options.lvl + 1 }));
        });
        return Promise.all(promises);
    }
    readNode(scenario, node, options) {
        let self = this;
        let moduleUniqueId = module_container_1.ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
        return Promise
            .resolve(self.loadModuleInstance(scenario.userId, node.pluginId, node.moduleId))
            .then(function (container) {
            self.system.runtime.modules.set(self.getRuntimeModuleKey(scenario.id, node.id, moduleUniqueId), container);
            return self.readNodes(scenario, node.nodes, options);
        })
            .catch(function (err) {
            self.logger.error("An error occurred during scenario reading", err);
            throw err;
        });
    }
    stopNodes(scenario, nodes, options = { lvl: -1 }) {
        nodes.forEach(function (node) {
            self.stopNode(scenario, node, { lvl: options.lvl + 1 });
        });
        return Promise.resolve();
    }
    stopNode(scenario, node, options) {
        let moduleId = module_container_1.ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
        let rtId = this.getRuntimeModuleKey(scenario.id, node.id, moduleId);
        let module = this.system.runtime.modules.get(rtId);
        this.logger.debug("Stopping %s", rtId);
        if (module) {
            module.instance.stop();
            this.system.runtime.modules.delete(rtId);
            this.logger.debug("module %s stopped and deleted from runtime", rtId);
        }
        if (node.type === "trigger") {
        }
        if (node.type === "task") {
            this.onTaskEnd(scenario, node, moduleId);
        }
        this.stopNodes(scenario, node.nodes, options);
    }
    loadModuleInstance(userId, pluginId, moduleId) {
        let plugin = null;
        return Promise
            .resolve()
            .then(function () {
            return self.system.apiService.findPlugin(userId, pluginId);
        })
            .then(function (data) {
            plugin = data;
            self.logger.debug("Load module instance from plugin %s", plugin.name);
            return self.system.moduleLoader.loadModule(plugin, moduleId);
        });
    }
    onTaskEnd(scenario, node, id) {
    }
    getRuntimeModuleKey(scenarioId, nodeId, moduleId) {
        return "scenario:" + scenarioId + ":node:" + nodeId + ":module:" + moduleId;
    }
}
exports.ScenarioReader = ScenarioReader;

"use strict";
var module_container_1 = require("../plugins/modules/module-container");
var self = null;
/**
 * @todo pour le moment tout est instancié au début de la lecture. Au besoin une demande de trigger/task est envoyé à l'instance.
 * @todo on pourrait imaginer instancier un module uniquement à la volée et le detruire ensuite. Il faut juste vérifier que l'instance éxiste ou non au besoin
 */
var ScenarioReader = (function () {
    function ScenarioReader(system) {
        self = this;
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ScenarioReader');
    }
    /**
     * Read a scenario from data.
     * Scenario once read are never removed from runtime, even if it is done.
     * It could be occurs when a trigger is one-time. A scenario is either active or inactive.
     *
     * @param scenario
     */
    ScenarioReader.prototype.readScenario = function (scenario) {
        var self = this;
        this.logger.debug("Read scenario %s", scenario.id);
        // register scenario in runtime
        // it prevent running more than once and also help dealing through the system
        this.system.runtime.scenarios.set(scenario.id, scenario);
        // execute each node
        return this
            .readNodes(scenario, scenario.nodes, { lvl: -1 })
            .catch(function (err) {
            self.logger.error("An error occurred while reading scenario %s", scenario.name);
            self.system.runtime.scenarios.delete(scenario.name);
            throw err;
        });
    };
    ScenarioReader.prototype.stopScenario = function (id) {
        var scenario = this.system.runtime.scenarios.get(id);
        this.system.runtime.scenarios.delete(id);
        return this.stopNodes(scenario, scenario.nodes);
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
        var plugin = null;
        var moduleUniqueId = module_container_1.ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
        return Promise
            .resolve(self.loadModuleInstance(scenario.userId, node.pluginId, node.moduleId))
            .then(function (container) {
            // add to global storage
            self.system.modules.set(self.getRuntimeModuleKey(scenario.id, node.id, moduleUniqueId), container);
            if (node.type === "trigger") {
                // Create the first demand for trigger at lvl 0 (root)
                if (options.lvl === 0) {
                    self.logger.debug("Create a new demand for trigger module from plugin %s", node.pluginId);
                    container.instance.onNewDemand(node.options, onTrigger.bind(self, scenario, node));
                }
            }
            if (node.type === "task") {
                // Run automatically task at lvl 0 (root) will be forbidden later eventually
                if (options.lvl === 0) {
                    self.logger.debug("Create a new demand for task module from plugin %s", node.pluginId, node.options);
                    container.instance.run(node.options, self.onTaskEnd.bind(self, scenario, node, container.uniqueId));
                }
            }
            self.readNodes(scenario, node.nodes, options);
        })
            .catch(function (err) {
            self.logger.error("An error occurred during scenario reading", err);
            throw err;
        });
        /**
         * read the triggers -1 and create a new demand
         * @param scenario
         * @param node
         */
        function onTrigger(scenario, node) {
            self.logger.debug("trigger execution", node.options, options);
            self.logger.debug("Loop over sub nodes (-1) to ask new trigger demand");
            node.nodes.forEach(function (subNode) {
                var moduleUniqueId = module_container_1.ModuleContainer.getModuleUniqueId(subNode.pluginId, subNode.moduleId);
                var runtimeModuleContainer = self.system.modules.get(self.getRuntimeModuleKey(scenario.id, subNode.id, moduleUniqueId));
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
    };
    /**
     * Stop each nodes modules to functioning
     * @param scenario
     * @param nodes
     * @param options
     * @returns {Promise<T>}
     */
    ScenarioReader.prototype.stopNodes = function (scenario, nodes, options) {
        if (options === void 0) { options = { lvl: -1 }; }
        nodes.forEach(function (node) {
            self.stopNode(scenario, node, { lvl: options.lvl + 1 });
        });
        return Promise.resolve();
    };
    ScenarioReader.prototype.stopNode = function (scenario, node, options) {
        // get the module instance
        var moduleId = module_container_1.ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
        var rtId = this.getRuntimeModuleKey(scenario.id, node.id, moduleId);
        var module = this.system.modules.get(rtId);
        this.logger.debug("Stopping %s", rtId);
        if (module) {
            module.instance.stop();
            this.system.modules.delete(rtId);
            this.logger.debug("module %s stopped and deleted from runtime", rtId);
        }
        if (node.type === "trigger") {
        }
        if (node.type === "task") {
            this.onTaskEnd(scenario, node, moduleId);
        }
        this.stopNodes(scenario, node.nodes, options);
    };
    ScenarioReader.prototype.loadModuleInstance = function (userId, pluginId, moduleId) {
        var plugin = null;
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
    };
    /**
     * @param scenario
     * @param node
     * @param id
     */
    ScenarioReader.prototype.onTaskEnd = function (scenario, node, id) {
        // remove from storage. At this point we do not have anymore reference of the instance in system
        // It's up to module to clean their stuff
        // this.system.modules.delete(this.getRuntimeModuleKey(scenario.id, node.id, id));
        // this.logger.debug("Task %s from plugin %s has been done and deleted from runtime storage", node.moduleId, node.pluginId);
    };
    /**
     * For now every module has its own instance, even if there are x time the same module
     * @param scenarioId
     * @param nodeId
     * @param moduleId
     * @returns {string}
     */
    ScenarioReader.prototype.getRuntimeModuleKey = function (scenarioId, nodeId, moduleId) {
        return "scenario:" + scenarioId + ":node:" + nodeId + ":module:" + moduleId;
    };
    return ScenarioReader;
}());
exports.ScenarioReader = ScenarioReader;

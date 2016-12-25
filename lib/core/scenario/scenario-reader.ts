"use strict";
import {System} from "../../system";
import {ModuleContainer} from "../plugins/modules/module-container";
import {SystemError} from "../error";
let self: ScenarioReader = null;

/**
 * @todo pour le moment tout est instancié au début de la lecture. Au besoin une demande de trigger/task est envoyé à l'instance.
 * @todo on pourrait imaginer instancier un module uniquement à la volée et le detruire ensuite. Il faut juste vérifier que l'instance éxiste ou non au besoin
 */
export class ScenarioReader {

    system: System;
    logger: any;

    constructor(system) {
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
    readScenario(scenario) {
        let self = this;
        this.logger.debug("Read scenario %s", scenario.id);

        // avoid read same scenario in same time
        if (this.system.runtime.scenarios.get(scenario.id)) {
            return Promise.reject(new SystemError("Already running", "alreadyRunning"));
        }

        // register scenario in runtime
        // it prevent running more than once and also help dealing through the system
        this.system.runtime.scenarios.set(scenario.id, scenario);

        // execute each node
        return this
            .readNodes(scenario, scenario.nodes, { lvl: -1 })
            // Once they are all registered and loaded
            // we run the first root trigger and tasks
            .then(function() {
                self.logger.debug("All nodes loaded, run the root nodes..");
                scenario.nodes.forEach(function (node) {
                    let moduleId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
                    let rtId = self.getRuntimeModuleKey(scenario.id, node.id, moduleId);
                    let module = self.system.runtime.modules.get(rtId);
                    if (node.type === "trigger") {
                        // Create the first demand for trigger at lvl 0 (root)
                        self.logger.debug("Create a new demand for trigger module from plugin %s", node.pluginId);
                        module.instance.onNewDemand(node.options, onTrigger.bind(self, scenario, node));
                    }

                    if (node.type === "task") {
                        // Run automatically task at lvl 0 (root) will be forbidden later eventually
                        self.logger.debug("Create a new demand for task module from plugin %s", node.pluginId, node.options);
                        module.instance.run(node.options, self.onTaskEnd.bind(self, scenario, node, module.uniqueId));
                    }
                })
            })
            .catch(function(err) {
                //@todo maybe remote it from Map ?
                self.logger.error("An error occurred while reading scenario %s", scenario.name, err);
                // self.system.runtime.scenarios.delete(scenario.name);
                throw err;
            });

            /**
             * read the triggers -1 and create a new demand
             * @param scenario
             * @param node
             */
            function onTrigger(scenario, node) {
                self.logger.debug("trigger execution", node.options);
                self.logger.debug("Loop over sub nodes (-1) to ask new trigger demand");

                node.nodes.forEach(function(subNode) {
                    let moduleUniqueId = ModuleContainer.getModuleUniqueId(subNode.pluginId, subNode.moduleId);
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

        // avoid stopping same scenario multiple times
        if (!this.system.runtime.scenarios.get(id)) {
            return Promise.reject(new SystemError("Already stopped", "alreadyStopped"));
        }

        let scenario = this.system.runtime.scenarios.get(id);
        this.system.runtime.scenarios.delete(id);
        return this.stopNodes(scenario, scenario.nodes)
    }

    getPluginsIds(scenario: Scenario) {
        let ids = [];
        scenario.nodes.forEach(function(node) {
            ids.push(node.pluginId);
        });
        return ids;
    }

    private readNodes(scenario: any, nodes: any[], options: any) {
        let promises = [];
        nodes.forEach(function(node) {
            promises.push(self.readNode(scenario, node, { lvl: options.lvl + 1 }));
        });

        return Promise.all(promises);
    }

    private readNode(scenario: any, node: any, options: any) {
        let self = this;
        let moduleUniqueId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);

        return Promise
            .resolve(self.loadModuleInstance(scenario.userId, node.pluginId, node.moduleId))
            .then(function(container) {

                // add to global storage
                self.system.runtime.modules.set(self.getRuntimeModuleKey(scenario.id, node.id, moduleUniqueId), container);

                return self.readNodes(scenario, node.nodes, options);
            })
            .catch(function(err) {
                self.logger.error("An error occurred during scenario reading", err);
                throw err;
            });
    }

    /**
     * Stop each nodes modules to functioning
     * @param scenario
     * @param nodes
     * @param options
     * @returns {Promise<T>}
     */
    private stopNodes(scenario: any, nodes: any[], options: any = { lvl: -1 }) {
        nodes.forEach(function(node) {
            self.stopNode(scenario, node, { lvl: options.lvl + 1 });
        });

        return Promise.resolve();
    }

    private stopNode(scenario: any, node: any, options: any) {
        // get the module instance
        let moduleId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
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

        return this.stopNodes(scenario, node.nodes, options);
    }

    private loadModuleInstance(userId: number, pluginId: string, moduleId: string) {
        let plugin = null;
        return Promise
            .resolve()
            // Get plugin info
            .then(function() {
                return self.system.sharedApiService.findPlugin(userId, pluginId);
            })
            // Load module instance
            .then(function(data) {
                plugin = data;
                self.logger.debug("Load module instance from plugin %s", plugin.name);
                return self.system.moduleLoader.loadModule(plugin, moduleId);
            });
    }

    /**
     * @param scenario
     * @param node
     * @param id
     */
    private onTaskEnd(scenario, node, id) {
        // remove from storage. At this point we do not have anymore reference of the instance in system
        // It's up to module to clean their stuff
        // this.system.runtime.modules.delete(this.getRuntimeModuleKey(scenario.id, node.id, id));
        // this.logger.debug("Task %s from plugin %s has been done and deleted from runtime storage", node.moduleId, node.pluginId);
    }

    /**
     * For now every module has its own instance, even if there are x time the same module
     * @param scenarioId
     * @param nodeId
     * @param moduleId
     * @returns {string}
     */
    private getRuntimeModuleKey(scenarioId, nodeId, moduleId) {
        return "scenario:" + scenarioId + ":node:" + nodeId + ":module:" + moduleId;
    }
}
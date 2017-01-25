"use strict";
import {System} from "../../system";
import {ModuleContainer} from "../plugins/modules/module-container";
import {SystemError} from "../error";
import {ScenarioModel} from "../../hooks/shared-server-api/lib/models/scenario";
import * as _ from "lodash";
import {ScenarioHelper} from "./scenario-helper";
import ScenarioReadable from "./scenario-readable";

/**
 * @todo pour le moment tout est instancié au début de la lecture. Au besoin une demande de trigger/task est envoyé à l'instance.
 * @todo on pourrait imaginer instancier un module uniquement à la volée et le detruire ensuite. Il faut juste vérifier que l'instance éxiste ou non au besoin
 */
export class ScenarioReader {

    protected system: System;
    protected logger: any;
    protected scenarios: Array<ScenarioReadable>;
    protected scenarioHelper: ScenarioHelper;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReader');
        this.scenarios = [];
        this.scenarioHelper = new ScenarioHelper(this.system);
    }

    public isRunning(scenario: ScenarioModel) {
        return this.system.scenarioReader.scenarios.find((scenarioReadable) => scenario.id === scenarioReadable.model.id);
    }

    /**
     * Read a scenario from data.
     * Scenario once read are never removed from runtime, even if it is done.
     * It could be occurs when a trigger is one-time. A scenario is either active or inactive.
     *
     * @param scenario
     * @param options
     */
    public readScenario(scenario: ScenarioModel, options: any = {}) {
        let self = this;
        options = _.merge({ loadPlugins: false }, options);

        this.logger.debug("Read scenario %s", scenario.id);

        return Promise.resolve(null)
            // Ensure plugins are loaded if option is set
            .then(function() {
                if (options.loadPlugins) {
                    self.logger.debug("Ensure plugins are loaded or load it if needed");
                    return self.loadPlugins(scenario);
                }
                return Promise.resolve();
            })
            .then(function() {
                let scenarioReadable = new ScenarioReadable(scenario);
                // register scenario in runtime
                // it prevent running more than once and also help dealing through the system
                self.system.scenarioReader.scenarios.push(scenarioReadable);

                return Promise.resolve()
                    // execute each node
                    .then(function() {
                        self.logger.verbose("[scenario:%s] load all nodes...", scenario.id);
                        return self.readNodes(scenarioReadable, scenario.nodes, { lvl: -1 });
                    })
                    // Once they are all registered and loaded
                    // we run the first root trigger and tasks
                    .then(function() {
                        self.logger.debug("[scenario:%s] all nodes have been loaded!", scenario.id);
                        self.logger.verbose("[scenario:%s] Run the root nodes..", scenario.id);
                        return self.runNodes(scenarioReadable, scenario.nodes);
                    })
                    .then(function() {
                        self.logger.debug("[scenario:%s] root nodes are now running!", scenario.id);
                        self.system.emit("running-scenarios:updated");

                        // listen for the last task being ran and stop the scenario if needed
                        scenarioReadable.on("task:stop", function() {
                            if (!scenarioReadable.hasRunningTasks()) {
                                // no more running task, we should stop the scenario
                                self.logger.verbose("[scenario:%s] event task:stop intercepted, there are no more task running, automatically stopping the scenario.", scenario.id);
                            } else {
                                self.logger.verbose("[scenario:%s] event task:stop intercepted, there are still some tasks running", scenario.id);
                            }
                        });
                    })
                    //as soon an error occurs we remove the scenario. A scenario is either running well or not.
                    .catch(function(err) {
                        // self.logger.error("An error occurred while reading scenario %s", scenario.name, err);
                        self.removeScenario(scenarioReadable);
                        throw err;
                    });
            });
    }

    /**
     * Stop all scenario relative to this id.
     * @param id
     */
    public stopScenarios(id) {
        let self = this;
        let concerned = this.scenarios.filter((tmp) => tmp.model.id === id);
        let promises = [];
        concerned.forEach(function(readable) {
            self.logger.verbose("Stopping scenario %s (execution id %s) ...", id, readable.executionId);
            self.removeScenario(readable);
            promises.push(
                self.stopNodes(readable, readable.model.nodes)
                    .then(function() {
                        self.logger.debug("scenario %s (execution id %s) stopped!", id, readable.executionId);
                        return Promise.resolve();
                    })
            );
        });

        return Promise.all(promises)
            .then(function() {
                self.system.emit("running-scenarios:updated");
                return Promise.resolve();
            });
    }

    public getRunningScenarios(): Array<ScenarioReadable> {
        return this.scenarios;
    }

    /**
     * @param scenario
     * @param nodes
     */
    protected runNodes(scenario: ScenarioReadable, nodes: Array<ScenarioModel>): Promise<void> {
        let self = this;
        nodes.forEach(function (node) {
            let moduleId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
            let rtId = self.getRuntimeModuleKey(scenario.executionId, node.id, moduleId);
            let module = self.system.runtime.modules.get(rtId);

            // we register the "thing" that a task is still running
            scenario.runningTasks.push(1);

            // wait for next tick so that we have time to attach events on promise chain.
            setImmediate(function() {
                if (node.type === "trigger") {
                    // Create the first demand for trigger at lvl 0 (root)
                    self.logger.debug("Create a new demand for trigger module from plugin %s", node.pluginId);
                    module.instance.onNewDemand(node.options,
                        function() {
                            // handle case of module developer forgot to clear trigger on stop
                            if (!self.isRunning(scenario.model)) {
                                self.logger.warn("The module '%s' from plugin '%s' just triggered a new demand. However the scenario is not running anymore. It probably means that a module is still running" +
                                    " (may be a timeout, interval or async treatment not closed). The trigger has been ignored but you should tell the author of the plugin about this warning", node.moduleId, node.pluginId);
                                return;
                                // @todo
                            } else {
                                // onTrigger(scenario, node);
                                return self.runNodes(scenario, node.nodes);
                            }
                        },
                        function() {
                            scenario.runningTasks.pop();
                            scenario.emit("task:stop");
                        }
                    );
                }
                // Tasks are one shot (one time running)
                // This is the most common case, just run the function and wait for its callback
                else {
                    runTask(module, node, null, function() {
                        scenario.runningTasks.pop();
                        scenario.emit("task:stop");
                    });
                }
            });
        });

        return Promise.resolve();

        // /**
        //  * read the triggers -1 and create a new demand
        //  * @param scenario
        //  * @param node
        //  * @param ingredients
        //  */
        // function onTrigger(scenario: ScenarioReadable, node: ScenarioModel, ingredients = null) {
        //     self.logger.debug("trigger execution", node.options, ingredients);
        //     self.logger.debug("Loop over sub nodes (-1) to ask new trigger demand");
        //
        //     // handle case of module developer forgot to clear trigger on stop
        //     if (!self.isRunning(scenario.model)) {
        //         self.logger.warn("The module '%s' from plugin '%s' just triggered a new demand. However the scenario is not running anymore. It probably means that a module is still running" +
        //             " (may be a timeout, interval or async treatment not closed). The trigger has been ignored but you should tell the author of the plugin about this warning", node.moduleId, node.pluginId);
        //         return;
        //     }
        //
        //     node.nodes.forEach(function(subNode) {
        //         let moduleUniqueId = ModuleContainer.getModuleUniqueId(subNode.pluginId, subNode.moduleId);
        //         let runtimeModuleContainer = self.system.runtime.modules.get(self.getRuntimeModuleKey(scenario.executionId, subNode.id, moduleUniqueId));
        //
        //         if (subNode.type === "trigger") {
        //             self.logger.debug("Create a new demand for trigger module from plugin %s", subNode.pluginId);
        //             runtimeModuleContainer.instance.onNewDemand(subNode.options,
        //                 function (ingredients) {
        //                     onTrigger(scenario, subNode, ingredients);
        //                 },
        //                 function() {
        //
        //                 }
        //             );
        //         }
        //
        //         if (subNode.type === "task") {
        //             runTask(runtimeModuleContainer, subNode, ingredients, function() {
        //
        //             });
        //         }
        //     });
        // }

        /**
         * @param moduleContainer
         * @param node
         * @param ingredients
         * @param done
         */
        function runTask(moduleContainer: ModuleContainer, node, ingredients = null, done: Function) {
            // parse options for eventual ingredients replacements
            // only string options are interpolated
            if (ingredients) {
                _.forEach(node.options, function(value, key) {
                    if (_.isString(value)) {
                        _.forEach(ingredients, function(ingredientValue, ingredientKey) {
                            node.options[key] = value.replace("{{" + ingredientKey + "}}", ingredientValue);
                        });
                    }
                });
            }

            self.logger.debug("Create a new demand for task module from plugin %s", node.pluginId, node.options);
            moduleContainer.instance.run(node.options, done);
        }


        /**
         * @param scenario
         * @param node
         * @param id
         */
        // function onTaskEnd(scenario, node, id) {
            // remove from storage. At this point we do not have anymore reference of the instance in system
            // It's up to module to clean their stuff
            // this.system.runtime.modules.delete(this.getRuntimeModuleKey(scenario.id, node.id, id));
            // this.logger.debug("Task %s from plugin %s has been done and deleted from runtime storage", node.moduleId, node.pluginId);
        // }
    }

    protected readNodes(scenario: ScenarioReadable, nodes: any[], options: any) {
        let self = this;
        let promises = [];
        nodes.forEach(function(node) {
            promises.push(self.readNode(scenario, node, { lvl: options.lvl + 1 }));
        });

        return Promise.all(promises);
    }

    /**
     * Read a node
     * @param scenario
     * @param node
     * @param options
     * @returns {Promise<U>}
     */
    protected readNode(scenario: ScenarioReadable, node: ScenarioModel, options: any) {
        let self = this;
        let moduleUniqueId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);

        return Promise
            .resolve(self.loadModuleInstance(null, node.pluginId, node.moduleId))
            .then(function(container) {

                // add to global storage
                self.system.runtime.modules.set(self.getRuntimeModuleKey(scenario.executionId, node.id, moduleUniqueId), container);

                return self.readNodes(scenario, node.nodes, options);
            });
    }

    /**
     * Stop each nodes modules to functioning
     * @param scenario
     * @param nodes
     * @param options
     */
    protected stopNodes(scenario: ScenarioReadable, nodes: any[], options: any = { lvl: -1 }) {
        let self = this;
        let wait = [];
        nodes.forEach(function(node) {
            wait.push(self.stopNode(scenario, node, { lvl: options.lvl + 1 }));
        });

        return Promise.all(wait);
    }

    protected stopNode(scenario: ScenarioReadable, node: any, options: any) {
        // get the module instance
        let moduleId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
        let rtId = this.getRuntimeModuleKey(scenario.executionId, node.id, moduleId);
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
            // this.onTaskEnd(scenario.model, node, moduleId);
        }

        return this.stopNodes(scenario, node.nodes, options);
    }

    protected loadModuleInstance(userId: number = null, pluginId: string, moduleId: string) {
        let self = this;
        let plugin = null;
        return Promise
            .resolve()
            // Get plugin info
            .then(function() {
                return self.system.sharedApiService.getPlugin(pluginId);
            })
            // Load module instance
            .then(function(data) {
                plugin = data;
                self.logger.debug("Load module instance from plugin %s", plugin.name);
                return self.system.moduleLoader.loadModule(plugin, moduleId);
            });
    }

    /**
     * For now every module has its own instance, even if there are x time the same module.
     * This method should return an unique key that is used by only one node.
     * @param scenarioExecutionId
     * @param nodeId
     * @param moduleId
     * @returns {string}
     */
    protected getRuntimeModuleKey(scenarioExecutionId: string, nodeId, moduleId) {
        return "scenario:" + scenarioExecutionId + ":node:" + nodeId + ":module:" + moduleId;
    }

    protected removeScenario(scenarioReadable: ScenarioReadable) {
        let index = this.scenarios.indexOf(scenarioReadable);
        return this.scenarios.splice(index, 1);
    }

    protected loadPlugins(scenario: ScenarioModel) {
        let self = this;
        // get a list of concerned plugins
        let ids = self.scenarioHelper.getPluginsIds(scenario);
        let promises = [];
        // load every plugins related to scenarios
        ids.forEach(function(id) {
            promises.push(
                self.system.sharedApiService
                    .getPlugin(id)
                    .then(function(plugin) {
                        return self.system.pluginsLoader.load(plugin)
                            .catch(function(err) {
                                if (err.code === SystemError.ERROR_CODE_PLUGIN_ALREADY_LOADED) {
                                    return Promise.resolve();
                                }
                                throw err;
                            });
                    })
            )
        });
        return Promise.all(promises);
    }
}
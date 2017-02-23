import { EventEmitter }  from "events";
import {ScenarioModel} from "../../hooks/shared-server-api/lib/models/scenario";
import * as uuid from "node-uuid";
import {ModuleContainer} from "../plugins/modules/module-container";
import {System} from "../../system";
import * as _ from "lodash";

/**
 * Root scenario. Has an execution id
 */
export default class ScenarioReadable extends EventEmitter {

    executionId: string;
    model: ScenarioModel;
    runningTasks: Array<any>;
    system: System;
    public state: string;
    protected logger: any;

    static STATE_STOPPING = "stopping";
    static STATE_RUNNING = "running";

    constructor(system, model: ScenarioModel) {
        super();
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReadable');
        this.executionId = uuid.v4();
        this.model = model;
        this.runningTasks = [];
        this.state = ScenarioReadable.STATE_RUNNING;
    }

    public toJSON() {
        return {
            executionId: this.executionId,
            model: this.model
        }
    }

    public hasRunningTasks() {
        return this.runningTasks.length > 0;
    }

    /**
     * @param nodes
     * @param parentIngredients
     * @returns {Promise<void>}
     */
    public runNodes(nodes: Array<ScenarioModel>, parentIngredients: any = null): Promise<void> {
        let self = this;
        let scenario = this;

        nodes.forEach(function (node) {
            let moduleId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
            let rtId = self.getRuntimeModuleKey(scenario.executionId, node.id, moduleId);
            let module = self.system.modules.get(rtId);
            let taskEndCallbackCalled = false;

            // ensure to not run the task if scenario is not running
            if (self.state === ScenarioReadable.STATE_RUNNING) {
                // we register the "thing" that a task is still running
                scenario.runningTasks.push(1);

                if (node.type === "trigger") {
                    // Create the first demand for trigger at lvl 0 (root)
                    self.logger.debug("Create a new demand for trigger module from plugin %s", node.pluginId);
                    module.instance.onNewDemand(node.options, triggerCallback, taskDoneCallback);
                }
                // Tasks are one shot (one time running)
                // This is the most common case, just run the function and wait for its callback
                else {
                    self.logger.debug("Create a new demand for task module from plugin %s", node.pluginId, node.options);
                    // parse options for eventual ingredients replacements
                    // only string options are interpolated
                    if (parentIngredients) {
                        _.forEach(node.options, function(value, key) {
                            if (_.isString(value)) {
                                _.forEach(parentIngredients, function(ingredientValue, ingredientKey) {
                                    node.options[key] = value.replace("{{" + ingredientKey + "}}", ingredientValue);
                                });
                            }
                        });
                    }

                    module.instance.run(node.options, taskDoneCallback);
                }

                function triggerCallback(ingredients) {
                    // handle case of module developer forgot to clear trigger on stop
                    if (self.state !== ScenarioReadable.STATE_RUNNING) {
                        self.logger.warn("The module '%s' from plugin '%s' just triggered a new demand. However the scenario is not running anymore. It probably means that a module is still running" +
                            " (may be a timeout, interval or async treatment not closed). The trigger has been ignored but you should tell the author of the plugin about this warning", node.moduleId, node.pluginId);
                    } else {
                        return self.runNodes(node.nodes, ingredients);
                    }
                }

                function taskDoneCallback() {
                    // "module want to call more than once callback" security
                    if (taskEndCallbackCalled) {
                        self.logger.warn("The module '%s' from plugin '%s' try to call a second time the task end callback. Ignore it", node.moduleId, node.pluginId);
                    }
                    // "module forgot to shutdown" security
                    else if (self.state !== ScenarioReadable.STATE_RUNNING) {
                        self.logger.warn("The module '%s' from plugin '%s' tried to call the taskDoneCallback too late, the scenario is already stopped.", node.moduleId, node.pluginId);
                    }
                    else {
                        taskEndCallbackCalled = true;
                        scenario.runningTasks.pop();
                        // wait for next tick so that we have time to attach events on promise chain.
                        // mainly used for the first call to runNodes
                        setImmediate(function() {
                            scenario.emit("task:stop");
                        });
                    }
                }
            }
        });

        return Promise.resolve();
    }

    public readNodes(scenario: ScenarioReadable, nodes: any[], options: any) {
        let self = this;
        let promises = [];
        nodes.forEach(function(node) {
            promises.push(self.readNode(scenario, node, { lvl: options.lvl + 1 }));
        });

        return Promise.all(promises);
    }

    /**
     * @returns {Promise}
     */
    public stop() {
        this.state = ScenarioReadable.STATE_STOPPING;
        return this.stopNodes(this, this.model.nodes)
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
        let module = this.system.modules.get(rtId);

        this.logger.debug("Stopping %s", rtId);
        if (module) {
            module.stopInstance();
            this.system.modules.delete(rtId);
            this.logger.debug("module %s stopped and deleted from runtime", rtId);
        }

        if (node.type === "trigger") {

        }

        if (node.type === "task") {
            // this.onTaskEnd(scenario.model, node, moduleId);
        }

        return this.stopNodes(scenario, node.nodes, options);
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
                self.system.modules.set(self.getRuntimeModuleKey(scenario.executionId, node.id, moduleUniqueId), container);

                return self.readNodes(scenario, node.nodes, options);
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
}
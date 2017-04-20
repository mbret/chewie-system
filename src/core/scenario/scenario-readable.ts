import { EventEmitter }  from "events";
let uuid = require("uuid");
import {ModuleContainer} from "../plugins/modules/module-container";
import {System} from "../../system";
import * as _ from "lodash";
import {PluginsLoader} from "../plugins/plugins-loader";
import {debug} from "../../shared/debug";
import {
    TriggerModuleInstanceInterface,
    TaskModuleInstanceInterface
} from "../plugins/modules/module-instance-interface";
import {ScenarioModel} from "../shared-server-api/lib/models/scenario";

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
    protected pluginsLoader: PluginsLoader;

    static STATE_STOPPING = "stopping";
    static STATE_RUNNING = "running";
    static STATE_STARTING = "starting";

    constructor(system, model: ScenarioModel) {
        super();
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReadable');
        this.executionId = uuid.v4();
        this.model = model;
        this.runningTasks = [];
        this.state = ScenarioReadable.STATE_STARTING;
        this.pluginsLoader = new PluginsLoader(system);
    }

    public toJSON() {
        return {
            executionId: this.executionId,
            model: this.model,
            state: this.state
        }
    }

    public hasRunningTasks() {
        return this.runningTasks.length > 0;
    }

    /**
     * @returns {Promise}
     */
    public stop() {
        this.state = ScenarioReadable.STATE_STOPPING;
        return this.stopNodes(this, this.model.nodes)
    }

    /**
     * @returns {Promise}
     */
    public start(ingredients) {
        let self = this;
        self.logger.verbose("[scenario:%s] load all nodes...", self.model.id);
        return this.startNodes(this, this.model.nodes, { lvl: -1 })
            .then(function() {
                self.state = ScenarioReadable.STATE_RUNNING;
                self.logger.debug("[scenario:%s] all nodes have been loaded!", self.model.id);
                self.logger.verbose("[scenario:%s] Run the root nodes..", self.model.id);

                // detach first run execution from the startup task
                // the task will run as long as the plugin is marked as running
                setImmediate(function() {
                    self.runNodes(self.model.nodes, ingredients);
                });

                return self;
            });
    }

    /**
     * @param nodes
     * @param parentIngredients
     * @returns {Promise<void>}
     */
    protected runNodes(nodes: Array<ScenarioModel>, parentIngredients: any) {
        let self = this;
        let scenario = this;

        nodes.forEach(function (node) {
            let moduleId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
            let rtId = self.getRuntimeModuleKey(scenario.executionId, node.id, moduleId);
            let module = self.system.modules.get(rtId);
            let taskEndCallbackCalled = false;
            let newDemandFn = null;

            // ensure to not run the task if scenario is not running
            if (self.state === ScenarioReadable.STATE_RUNNING) {
                // we register the "thing" that a task is still running
                scenario.runningTasks.push(1);

                // parse options for eventual ingredients replacements
                // only string options are interpolated
                _.forEach(node.options, function(value, key) {
                    let replacedValue = value;
                    if (_.isString(value)) {
                        _.forEach(parentIngredients, function(ingredientValue, ingredientKey) {
                            replacedValue = replacedValue.replace(new RegExp(_.escapeRegExp("{{" + ingredientKey + "}}"), "g"), ingredientValue);
                            node.options[key] = replacedValue;
                        });
                    }
                });

                debug("scenario:" + self.executionId)("Create a new demand for (%s) module [%s] from plugin [%s]", node.type, module.moduleInfo.id, node.pluginId);

                if (node.type === "trigger") {
                    // Create the first demand for trigger at lvl 0 (root)
                    newDemandFn = (<TriggerModuleInstanceInterface>module.instance).newDemand.bind(module.instance, node.options, triggerCallback, taskDoneCallback);
                } else {
                    newDemandFn = (<TaskModuleInstanceInterface>module.instance).newDemand.bind(module.instance, node.options, taskDoneCallback);
                }

                // run demand
                try {
                    newDemandFn();
                } catch (err) {
                    self.logger.error("Unexpected error of module [%s] from plugin [%s] on scenario [%s] when trying to run the task", module.moduleInfo.id, node.pluginId, self.executionId, err);
                }

                function triggerCallback(ingredientsFromModule) {
                    // handle case of module developer forgot to clear trigger on stop
                    if (self.state !== ScenarioReadable.STATE_RUNNING) {
                        self.logger.warn("The module '%s' from plugin '%s' just triggered a new demand. However the scenario is not running anymore. It probably means that a module is still running" +
                            " (may be a timeout, interval or async treatment not closed). The trigger has been ignored but you should tell the author of the plugin about this warning", node.moduleId, node.pluginId);
                    } else {
                        debug("scenario:" + self.executionId)("(trigger) module [%s] from plugin [%s] called the \"trigger\" callback", module.moduleInfo.id, node.pluginId);
                        runSubNodes(ingredientsFromModule);
                    }
                }

                function taskDoneCallback(err, ingredientsFromModule) {
                    // "module want to call more than once callback" security
                    if (taskEndCallbackCalled) {
                        self.logger.warn("The module '%s' from plugin '%s' try to call a second time the task end callback. Ignore it", node.moduleId, node.pluginId);
                    }
                    // "module forgot to shutdown" security
                    else if (self.state !== ScenarioReadable.STATE_RUNNING) {
                        self.logger.warn("The module [%s] from plugin '%s' tried to call the taskDoneCallback too late, the scenario is already stopped.", node.moduleId, node.pluginId);
                    }
                    else {
                        debug("scenario:" + self.executionId)("(%s) module [%s] from plugin [%s] called the \"done\" callback", module.moduleInfo.type, module.moduleInfo.id, node.pluginId);
                        taskEndCallbackCalled = true;
                        scenario.runningTasks.pop();
                        if (err) {
                            // for now we do nothing
                        }
                        // in case of task we run sub nodes on end
                        if (node.type === "task") {
                            runSubNodes(ingredientsFromModule);
                        }
                        // wait for next tick so that we have time to attach events on promise chain.
                        // mainly used for the first call to runNodes
                        setImmediate(function() {
                            scenario.emit("task:stop");
                        });
                    }
                }

                function runSubNodes(ingredientsFromModule) {
                    self.system.scenarioReader.getRuntimeIngredients()
                        .then(function(ingredients) {
                            return self.runNodes(node.nodes, _.merge(ingredients, ingredientsFromModule));
                        });
                }
            }
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
        let self = this;
        let moduleId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
        let rtId = this.getRuntimeModuleKey(scenario.executionId, node.id, moduleId);
        let module = this.system.modules.get(rtId);
        this.logger.debug("Stopping module instance [%s]", rtId);

        // module is running
        let promise = Promise.resolve();
        if (module) {
            promise.then(function() {
                return module
                    .stopInstance()
                    .then(function() {
                        self.system.modules.delete(rtId);
                        self.logger.debug("module %s stopped and deleted from runtime", rtId);
                    });
            });
        }

        return promise.then(function() {
            return self.stopNodes(scenario, node.nodes, options);
        });
    }

    protected startNodes(scenario: ScenarioReadable, nodes: any[], options: any) {
        let self = this;
        let promises = [];
        nodes.forEach(function(node) {
            promises.push(self.startNode(scenario, node, { lvl: options.lvl + 1 }));
        });

        return Promise.all(promises);
    }

    /**
     * Read a node
     * @param scenario
     * @param node
     * @param options
     * @returns {Promise}
     */
    protected startNode(scenario: ScenarioReadable, node: ScenarioModel, options: any) {
        let self = this;
        let moduleUniqueId = ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);

        return Promise.resolve()
            .then(() => self.loadModuleInstance(null, node.pluginId, node.moduleId))
            .then(function(container) {

                // add to global storage
                let uniqueId = self.getRuntimeModuleKey(scenario.executionId, node.id, moduleUniqueId);
                self.logger.debug("New module container registered with key [%s]", uniqueId);
                self.system.modules.set(uniqueId, container);

                return self.startNodes(scenario, node.nodes, options);
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

    protected loadModuleInstance(userId: number = null, pluginId: string, moduleId: string): Promise<ModuleContainer> {
        let self = this;
        let plugin = null;
        // fetch plugin container
        let container = self.pluginsLoader.getPluginContainerByName(pluginId);
        if (!container || !container.isMounted()) {
            return Promise.reject("Plugin " + pluginId + " is not running");
        }
        self.logger.debug("Load new module [%s] instance from plugin [%s]", moduleId, pluginId);
        return self.system.moduleLoader.loadModule(container, moduleId);
    }
}
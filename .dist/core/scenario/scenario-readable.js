"use strict";
const events_1 = require("events");
const uuid = require("node-uuid");
const module_container_1 = require("../plugins/modules/module-container");
const _ = require("lodash");
class ScenarioReadable extends events_1.EventEmitter {
    constructor(system, model) {
        super();
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReadable');
        this.executionId = uuid.v4();
        this.model = model;
        this.runningTasks = [];
        this.state = ScenarioReadable.STATE_RUNNING;
    }
    toJSON() {
        return {
            executionId: this.executionId,
            model: this.model
        };
    }
    hasRunningTasks() {
        return this.runningTasks.length > 0;
    }
    runNodes(nodes, parentIngredients = null) {
        let self = this;
        let scenario = this;
        nodes.forEach(function (node) {
            let moduleId = module_container_1.ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
            let rtId = self.getRuntimeModuleKey(scenario.executionId, node.id, moduleId);
            let module = self.system.runtime.modules.get(rtId);
            let taskEndCallbackCalled = false;
            if (self.state === ScenarioReadable.STATE_RUNNING) {
                scenario.runningTasks.push(1);
                if (node.type === "trigger") {
                    self.logger.debug("Create a new demand for trigger module from plugin %s", node.pluginId);
                    module.instance.onNewDemand(node.options, triggerCallback, taskDoneCallback);
                }
                else {
                    self.logger.debug("Create a new demand for task module from plugin %s", node.pluginId, node.options);
                    if (parentIngredients) {
                        _.forEach(node.options, function (value, key) {
                            if (_.isString(value)) {
                                _.forEach(parentIngredients, function (ingredientValue, ingredientKey) {
                                    node.options[key] = value.replace("{{" + ingredientKey + "}}", ingredientValue);
                                });
                            }
                        });
                    }
                    module.instance.run(node.options, taskDoneCallback);
                }
                function triggerCallback(ingredients) {
                    if (self.state !== ScenarioReadable.STATE_RUNNING) {
                        self.logger.warn("The module '%s' from plugin '%s' just triggered a new demand. However the scenario is not running anymore. It probably means that a module is still running" +
                            " (may be a timeout, interval or async treatment not closed). The trigger has been ignored but you should tell the author of the plugin about this warning", node.moduleId, node.pluginId);
                    }
                    else {
                        return self.runNodes(node.nodes, ingredients);
                    }
                }
                function taskDoneCallback() {
                    if (taskEndCallbackCalled) {
                        self.logger.warn("The module '%s' from plugin '%s' try to call a second time the task end callback. Ignore it", node.moduleId, node.pluginId);
                    }
                    else if (self.state !== ScenarioReadable.STATE_RUNNING) {
                        self.logger.warn("The module '%s' from plugin '%s' tried to call the taskDoneCallback too late, the scenario is already stopped.", node.moduleId, node.pluginId);
                    }
                    else {
                        taskEndCallbackCalled = true;
                        scenario.runningTasks.pop();
                        setImmediate(function () {
                            scenario.emit("task:stop");
                        });
                    }
                }
            }
        });
        return Promise.resolve();
    }
    readNodes(scenario, nodes, options) {
        let self = this;
        let promises = [];
        nodes.forEach(function (node) {
            promises.push(self.readNode(scenario, node, { lvl: options.lvl + 1 }));
        });
        return Promise.all(promises);
    }
    stop() {
        this.state = ScenarioReadable.STATE_STOPPING;
        return this.stopNodes(this, this.model.nodes);
    }
    stopNodes(scenario, nodes, options = { lvl: -1 }) {
        let self = this;
        let wait = [];
        nodes.forEach(function (node) {
            wait.push(self.stopNode(scenario, node, { lvl: options.lvl + 1 }));
        });
        return Promise.all(wait);
    }
    stopNode(scenario, node, options) {
        let moduleId = module_container_1.ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
        let rtId = this.getRuntimeModuleKey(scenario.executionId, node.id, moduleId);
        let module = this.system.runtime.modules.get(rtId);
        this.logger.debug("Stopping %s", rtId);
        if (module) {
            module.stopInstance();
            this.system.runtime.modules.delete(rtId);
            this.logger.debug("module %s stopped and deleted from runtime", rtId);
        }
        if (node.type === "trigger") {
        }
        if (node.type === "task") {
        }
        return this.stopNodes(scenario, node.nodes, options);
    }
    readNode(scenario, node, options) {
        let self = this;
        let moduleUniqueId = module_container_1.ModuleContainer.getModuleUniqueId(node.pluginId, node.moduleId);
        return Promise
            .resolve(self.loadModuleInstance(null, node.pluginId, node.moduleId))
            .then(function (container) {
            self.system.runtime.modules.set(self.getRuntimeModuleKey(scenario.executionId, node.id, moduleUniqueId), container);
            return self.readNodes(scenario, node.nodes, options);
        });
    }
    getRuntimeModuleKey(scenarioExecutionId, nodeId, moduleId) {
        return "scenario:" + scenarioExecutionId + ":node:" + nodeId + ":module:" + moduleId;
    }
    loadModuleInstance(userId = null, pluginId, moduleId) {
        let self = this;
        let plugin = null;
        return Promise
            .resolve()
            .then(function () {
            return self.system.sharedApiService.getPlugin(pluginId);
        })
            .then(function (data) {
            plugin = data;
            self.logger.debug("Load module instance from plugin %s", plugin.name);
            return self.system.moduleLoader.loadModule(plugin, moduleId);
        });
    }
}
ScenarioReadable.STATE_STOPPING = "stopping";
ScenarioReadable.STATE_RUNNING = "running";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScenarioReadable;
//# sourceMappingURL=scenario-readable.js.map
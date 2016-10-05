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
        scenario.nodes.forEach(function (node) {
            if (node.type === "trigger") {
                self.readTriggerNode(node);
            }
        });
        return Promise.resolve();
    };
    ScenarioReader.prototype.readTriggerNode = function (node) {
        // load plugin
        this.system.apiService;
        return this.system.moduleLoader.loadModule(plugin, node.triggerId)
            .then(function (moduleInstance) {
        });
    };
    return ScenarioReader;
})();
exports.ScenarioReader = ScenarioReader;

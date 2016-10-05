"use strict";

import {Daemon} from "../../daemon";

export class ScenarioReader {

    system: Daemon;
    logger: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ScenarioReader');
    }

    /**
     * Read a scenario from data
     * @param scenario
     */
    readScenario(scenario) {
        var self = this;
        this.logger.debug("Read scenario %s", scenario.id);

        // execute each node
        scenario.nodes.forEach(function(node) {
            if (node.type === "trigger") {
                self.readTriggerNode(node);
            }
        });
        return Promise.resolve();
    }

    readTriggerNode(node: any) {
        // load plugin
        this.system.apiService

        return this.system.moduleLoader.loadModule(plugin, node.triggerId)
            .then(function(moduleInstance) {

            });
    }
}
"use strict";
import {System} from "../../system";

/**
 *
 */
export class ScenarioHelper {

    system: System;
    logger: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ScenarioReader');
    }

    getPluginsIds(scenario: Scenario) {
        let ids = [];
        scenario.nodes.forEach(function(node) {
            ids.push(node.pluginId);
        });
        return ids;
    }

    getScenariosUsingPlugin(plugin: Plugin) {
        let self = this;
        let scenarios = [];
        self.system.runtime.scenarios.forEach(function(scenario, id) {
            let pluginsIds = self.getPluginsIds(scenario);
            if (pluginsIds.indexOf(plugin.id) > 0) {
                scenarios.push(scenario);
            }
        });

        return scenarios;
    }

    isAbleToStart(scenario: Scenario) {
        let self = this;
        let ok = true;
        let pluginsIds = self.getPluginsIds(scenario);
        pluginsIds.forEach(function(id) {
            if (!self.system.runtime.plugins.get(id)) {
                ok = false;
            }
        });

        return ok;
    }
}
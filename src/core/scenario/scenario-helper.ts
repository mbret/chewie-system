"use strict";

import {System} from "../../system";
import {ScenarioModel} from "../../hooks/shared-server-api/lib/models/scenario";
import * as _ from "lodash";
import {PluginsLoader} from "../plugins/plugins-loader";

/**
 *
 */
export class ScenarioHelper {

    system: System;
    logger: any;
    pluginsLoader: PluginsLoader;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReader');
        this.pluginsLoader = new PluginsLoader(system);
    }

    getPluginsIds(scenario: ScenarioModel) {
        let ids = [];
        scenario.nodes.forEach(function(node) {
            ids.push(node.pluginId);
        });
        return _.uniq(ids);
    }

    // getScenariosUsingPlugin(plugin: Plugin) {
    //     let self = this;
    //     let scenarios = [];
    //     self.system.scenarioReader.scenarios.forEach(function(scenario, id) {
    //         let pluginsIds = self.getPluginsIds(scenario);
    //         if (pluginsIds.indexOf(plugin.id) > 0) {
    //             scenarios.push(scenario);
    //         }
    //     });
    //
    //     return scenarios;
    // }

    /**
     * Ensure all plugins are loaded.
     * @param scenario
     * @returns {boolean}
     */
    isAbleToStart(scenario: ScenarioModel) {
        let self = this;
        let ok = true;
        let pluginsIds = self.getPluginsIds(scenario);
        pluginsIds.forEach(function(id) {
            if (!self.pluginsLoader.getPluginContainerByName(id)) {
                ok = false;
            }
        });

        return ok;
    }
}
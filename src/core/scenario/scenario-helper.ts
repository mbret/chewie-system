"use strict";

import {System} from "../../system";
import {ScenarioModel} from "../../hooks/shared-server-api/lib/models/scenario";
import * as _ from "lodash";
import {PluginsLoader} from "../plugins/plugins-loader";
import {Plugin} from "../../hooks/shared-server-api/lib/models/plugins";
import ScenarioReadable from "./scenario-readable";

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

    public getPluginsNames(scenario: ScenarioModel): Array<String> {
        return _.uniq(this._getPluginsNames(scenario.nodes));
    }

    protected _getPluginsNames(nodes: Array<any>): Array<String> {
        let self = this;
        let ids = [];
        nodes.forEach(function(node) {
            ids.push(node.pluginId);
            ids = ids.concat(self._getPluginsNames(node.nodes));
        });
        return ids;
    }

    getScenariosId(plugin: Plugin) {
        let self = this;
        let scenariosIds = [];
        let scenarios = this.system.scenarioReader.getScenarios();
        scenarios.forEach(function(scenario: ScenarioReadable) {
             let names = self.getPluginsNames(scenario.model);
             if (names.indexOf(plugin.name) > -1) {
                 scenariosIds.push(scenario.executionId);
             }
        });

        return scenariosIds;
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
     * Return all running scenarios relative to a scenario id.
     * @param scenario
     */
    public getRunningScenariosForModelId(scenario: ScenarioModel) {
        return this.system.scenarioReader.getScenarios().filter((tmp) => tmp.model.id === scenario.id);
    }

    public getRunningScenarios() {
        return this.system.scenarioReader.getScenarios().filter((scenario) => scenario.state === ScenarioReadable.STATE_RUNNING);
    }

    /**
     * Ensure all plugins are loaded.
     * @param scenario
     * @returns {boolean}
     */
    // isAbleToStart(scenario: ScenarioModel) {
    //     let self = this;
    //     let ok = true;
    //     let pluginsIds = self.getPluginsNames(scenario);
    //     pluginsIds.forEach(function(id) {
    //         if (!self.pluginsLoader.getPluginContainerByName(id)) {
    //             ok = false;
    //         }
    //     });
    //
    //     return ok;
    // }
}
"use strict";

import * as _ from "lodash";
import {HookInterface, Hook} from "../../core/hook-interface";
import {System} from "../../system";
import {ScenarioHelper} from "../../core/scenario/scenario-helper";
import {ScenarioModel} from "../shared-server-api/lib/models/scenario";

/**
 * Scenario are loaded automatically when:
 * - new scenario created on server and all plugins are loaded
 * - runtime plugins updated (loaded/unloaded)
 *
 * Scenario are stopped automatically when:
 * - the scenario has been deleted
 * - runtime plugins updated (loaded/unloaded)
 */
export = class ScenariosHook extends Hook implements HookInterface, InitializeAbleInterface {

    scenariosHelper: ScenarioHelper;

    constructor(system: System, config) {
        super(system, config);
        this.scenariosHelper = new ScenarioHelper(this.system);
    }

    initialize() {
        let self = this;

        // Listen for scenarios update. Also the event data is a list of updated scenario (not deleted)
        // data contain list of updated id
        this.system.sharedApiService.io.on("scenarios:updated", function(data) {
            self.logger.verbose("Scenarios updated on server, try to update scenarios state and force reloading of scenarios [%s]", data.updated);
            return updateScenarioState(data.updated);
        });

        // Listen for new plugin loaded / unloaded
        // Whenever a new plugin is loaded we try to check if a scenario is able to start now
        this.system.on("plugins:updated", function() {
            self.logger.verbose("The runtime plugins have been updated, try to update scenarios states..");
            return updateScenarioState();
        });

        /**
         * Run scenarios that need to be.
         * Stop scenario that need to be.
         */
        function updateScenarioState(scenariosToForceReload: Array<number> = []) {
            // fetch all scenarios
            return self.system.sharedApiService
                .getAllScenarios()
                .then(function(response: any) {
                    let scenarios: Array<ScenarioModel> = response.body;
                    self.logger.verbose("%s scenario(s) found: ids=[%s], check current state(s) and start/stop scenario(s) if needed", scenarios.length, scenarios.map(function(e) { return e.id; }));
                    // run or stop server scenarios
                    scenarios.forEach(function(scenario: ScenarioModel) {
                        let shouldRestartBecauseOfServerUpdate = scenariosToForceReload.indexOf(scenario.id) > -1;
                        // If scenario is not already running and is able to run now, then start it.
                        if (self.scenariosHelper.isAbleToStart(scenario) && !self.system.scenarioReader.isRunning(scenario) && scenario.autoStart) {
                            return self.readScenario(scenario);
                        }
                        // Scenario is not able to start but is loaded, we need to stop it
                        // we will basically stop all scenarios with that id
                        else if (!self.scenariosHelper.isAbleToStart(scenario) && self.system.scenarioReader.isRunning(scenario)) {
                            return self.stopScenarios(scenario);
                        }
                        // Scenario is ok and running but must be reloaded because it has been updated on server
                        else if (self.scenariosHelper.isAbleToStart(scenario) && self.system.scenarioReader.isRunning(scenario) && shouldRestartBecauseOfServerUpdate) {
                            return self.reloadScenario(scenario);
                        }
                    });
                    // stop runtime scenario not present on server anymore
                    // get list of running scenarios (avoid having multiple scenario for same id with uniqWith)
                    // if the running scenario id is not present in list of scenarios, then we stop all runnings scenarios for this id
                    let uniqueIdRunningScenarios = _.uniqWith(self.system.scenarioReader.getRunningScenarios(), (a, b) => a.model.id === b.model.id);
                    uniqueIdRunningScenarios.forEach(function(readable) {
                        if (!_.find(scenarios, {id: readable.model.id}) && self.system.scenarioReader.isRunning(readable.model)) {
                            return self.stopScenarios(readable.model);
                        }
                    });
                });
        }

        return Promise.resolve();
    }

    getLogger() {
        return this.system.logger.getLogger('ScenariosHook');
    }

    /**
     * Read scenarios
     * - force synchronizing plugins before
     * - force loading plugins before
     */
    readScenario(scenario) {
        let self = this;
        return self.system.scenarioReader.readScenario(scenario)
            .catch(function(err) {
                self.logger.error("Unable to read and start scenario %s", scenario.id, err);
                return self.system.sharedApiService.createNotification("Unable to start scenario " + scenario.id + " automatically", "warning");
            });
    }

    /**
     * Stop all scenarios relative to this scenario
     * @param scenario
     * @returns {Promise<U>}
     */
    stopScenarios(scenario) {
        let self = this;
        self.logger.verbose("Trying to stop scenario %s", scenario.id);
        return self.system.scenarioReader.stopScenarios(scenario.id)
            .then(function() {
                self.logger.verbose("Scenarios relative to id %s are stopped and suppressed from system", scenario.id);
            })
            .catch(function(err) {
                self.logger.error("Unable to stop scenarios for id %s", scenario.id, err);
            });
    }

    reloadScenario(scenario) {
        let self = this;
        self.logger.verbose("Trying to reload scenario %s", scenario.id);
        return self.system.scenarioReader.stopScenarios(scenario.id)
            .then(function() {
                return self.system.scenarioReader.readScenario(scenario);
            })
            .then(function() {
                self.logger.verbose("Scenario %s reloaded", scenario.id);
            })
            .catch(function(err) {
                self.logger.error("Unable to reload scenario " + scenario.id, err);
            });
    }
}
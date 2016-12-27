"use strict";

import * as _ from "lodash";
import {HookInterface, Hook} from "../../core/hook-interface";
import {System} from "../../system";
import {ScenarioHelper} from "../../core/scenario/scenario-helper";
import {Scenario} from "../../shared-server-api/lib/models/scenario";

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

    constructor(system: System) {
        super(system);
        this.scenariosHelper = new ScenarioHelper(this.system);
    }

    initialize() {
        let self = this;

        this.system.sharedApiService.io.on("scenarios:updated", function() {
            self.logger.verbose("Scenarios updated on server, try to update scenarios state");
            return updateScenarioState();
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
        function updateScenarioState() {
            // fetch all scenarios
            return self.system.sharedApiService
                .getAllScenarios()
                .then(function(response: any) {
                    let scenarios: Array<Scenario> = response.body;
                    self.logger.verbose("%s scenario(s) found: ids=[%s], check current state(s) and start/stop scenario(s) if needed", scenarios.length, scenarios.map(function(e) { return e.id; }));
                    // run or stop server scenarios
                    scenarios.forEach(function(scenario: Scenario) {
                        // If scenario is not already running and is able to run now, then start it.
                        if (self.scenariosHelper.isAbleToStart(scenario) && !self.system.scenarioReader.isRunning(scenario)) {
                            return self.readScenario(scenario);
                        }
                        // Scenario is not able to start but is loaded, we need to stop it
                        else if (!self.scenariosHelper.isAbleToStart(scenario) && self.system.scenarioReader.isRunning(scenario)) {
                            return self.stopScenario(scenario);
                        }
                    });
                    // stop runtime scenario not present on server anymore
                    self.system.runtime.scenarios.forEach(function(scenario) {
                        if (!_.find(scenarios, {id: scenario.id}) && self.system.scenarioReader.isRunning(scenario)) {
                            return self.stopScenario(scenario);
                        }
                    });
                });
        }

        return Promise.resolve();
    }

    getLogger() {
        return this.system.logger.Logger.getLogger('ScenariosHook');
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

    stopScenario(scenario) {
        let self = this;
        self.logger.verbose("Trying to stop scenario %s", scenario.id);
        return self.system.scenarioReader.stopScenario(scenario.id)
            .then(function() {
                self.logger.verbose("Scenario %s stopped and suppressed from system", scenario.id);
            })
            .catch(function(err) {
                self.logger.error("Unable to stop scenario", err);
            });
    }
}
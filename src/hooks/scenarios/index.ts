"use strict";

import * as _ from "lodash";
import {HookInterface} from "../../core/hook-interface";
import {System} from "../../system";
import {ScenarioHelper} from "../../core/scenario/scenario-helper";
import {Hook} from "../../core/hook";
import {SystemError} from "../../core/error";
import {ScenarioModel} from "../../core/shared-server-api/lib/models/scenario";
import {debug as hookDebug} from "../../shared/debug";
let debug = hookDebug(":hook:scenarios");

/**
 * Scenario are loaded automatically when:
 * - new scenario created on server and all plugins are loaded
 * - runtime plugins updated (loaded/unloaded)
 *
 * Scenario are stopped automatically when:
 * - the scenario has been deleted
 * - runtime plugins updated (loaded/unloaded)
 */
export = class ScenariosHook extends Hook implements HookInterface {

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
            self.logger.verbose("Scenarios updated on server, try to update running scenarios related to scenarios [%s]", data.updated);
            return updateScenarioState(data);
        });

        // We do not listen for plugins:
        // - unmount: because it stop automatically scenarios
        // - mount: scenario start automatically on system ready but that's all
        // - updated: run a unmount/mount ..

        // On system ready run all scenarios that should.
        // Some scenarios may not be able to start if their plugins does not exist on server.
        this.system.on("ready", function() {
            return self.system.sharedApiService
                .getAllScenarios()
                .then(function(response: any) {
                    let scenarios: Array<ScenarioModel> = response.body;
                    self.logger.verbose("%s scenario(s) found: ids=[%s], run one runtime execution for each scenario.", scenarios.length, scenarios.map(function(e) { return e.id; }));
                    scenarios.forEach(function(scenario) {
                        return self.startScenario(scenario);
                    });
                })
                .catch((err) => {
                    this.logger.error(`Unable to retrieve scenarios because of api error: ${err.message}`);
                });
        });

        /**
         * Run scenarios that need to be.
         * Stop scenario that need to be.
         */
        function updateScenarioState(scenariosToStopOrStart: any = []) {
            scenariosToStopOrStart = _.merge({deleted: [], updated: [], created: []}, scenariosToStopOrStart);
            let scenariosToStop = scenariosToStopOrStart.deleted.concat(scenariosToStopOrStart.updated);
            let scenariosToStart = scenariosToStopOrStart.created;

            // fetch all scenarios
            return self.system.sharedApiService
                .getAllScenarios()
                .then(function(response: any) {
                    let scenarios: Array<ScenarioModel> = response.body;
                    self.logger.verbose("%s scenario(s) found: ids=[%s], check current state(s) and start/stop scenario(s) if needed", scenarios.length, scenarios.map(function(e) { return e.id; }));

                    // loop over all scenario from server
                    scenarios.forEach(function(scenario: ScenarioModel) {
                        // do we have a scenario that have been updated or deleted lastly ?
                        if (scenariosToStop.indexOf(scenario.id) > -1) {
                            // scenario has to be stopped because it is outdated
                            return self.stopScenario(scenario);
                        }

                        // do we have a new scenario lastly ?
                        if (scenariosToStart.indexOf(scenario.id) > -1) {
                            // scenario has to be stopped because it is outdated
                            return self.startScenario(scenario);
                        }
                    });

                    // stop runtime scenario not present on server anymore
                    // get list of running scenarios (avoid having multiple scenario for same id with uniqWith)
                    // if the running scenario id is not present in list of scenarios, then we stop all running scenarios for this id
                    let uniqueIdRunningScenarios = _.uniqWith(self.system.scenarioReader.getScenarios(), (a, b) => a.model.id === b.model.id);
                    uniqueIdRunningScenarios.forEach(function(readable) {
                        if (!_.find(scenarios, {id: readable.model.id})) {
                            return self.stopScenario(readable.model);
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
    startScenario(scenario: ScenarioModel) {
        let self = this;
        return self.system.scenarioReader.startScenario(scenario)
            .catch(function(err) {
                if (err.code === SystemError.ERROR_CODE_PLUGIN_MISSING) {
                    self.logger.verbose("Scenario %s is not able to start because of some plugins missing", scenario.id);
                    return self.system.sharedApiService.createNotification("The scenario " + scenario.id + " can't be started because some plugins are missing", "warning");
                }
                self.logger.error("Unable to read and start scenario %s", scenario.id, err);
                return self.system.sharedApiService.createNotification("Unable to start scenario " + scenario.id + " automatically. You may find more details on system logs.", "warning");
            });
    }

    /**
     * Stop all scenarios execution relative to this scenario
     * @returns {Promise}
     * @param scenario
     */
    stopScenario(scenario: ScenarioModel) {
        let self = this;
        self.logger.verbose("Trying to stop all running scenarios relative to scenario [%s:%s]", scenario.id, scenario.name);
        let scenariosReadable = self.scenariosHelper.getRunningScenariosForModelId(scenario);
        scenariosReadable.forEach(function(scenarioReadable) {
            return self.system.scenarioReader.stopScenario(scenarioReadable.executionId)
                .then(function() {
                    self.logger.verbose("Running scenario %s from scenario %s has been stopped", scenarioReadable.executionId, scenario.id);
                });
        });
    }
}
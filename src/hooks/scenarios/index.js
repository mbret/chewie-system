"use strict";
const _ = require("lodash");
const hook_interface_1 = require("../../core/hook-interface");
const scenario_helper_1 = require("../../core/scenario/scenario-helper");
module.exports = class ScenariosHook extends hook_interface_1.Hook {
    constructor(system, config) {
        super(system, config);
        this.scenariosHelper = new scenario_helper_1.ScenarioHelper(this.system);
    }
    initialize() {
        let self = this;
        this.system.sharedApiService.io.on("scenarios:updated", function (data) {
            self.logger.verbose("Scenarios updated on server, try to update scenarios state and force reloading of scenarios [%s]", data.updated);
            return updateScenarioState(data.updated);
        });
        this.system.on("plugins:updated", function () {
            self.logger.verbose("The runtime plugins have been updated, try to update scenarios states..");
            return updateScenarioState();
        });
        function updateScenarioState(scenariosToForceReload = []) {
            return self.system.sharedApiService
                .getAllScenarios()
                .then(function (response) {
                let scenarios = response.body;
                self.logger.verbose("%s scenario(s) found: ids=[%s], check current state(s) and start/stop scenario(s) if needed", scenarios.length, scenarios.map(function (e) { return e.id; }));
                scenarios.forEach(function (scenario) {
                    let shouldRestartBecauseOfServerUpdate = scenariosToForceReload.indexOf(scenario.id) > -1;
                    if (self.scenariosHelper.isAbleToStart(scenario) && scenario.autoStart) {
                        return self.startScenario(scenario);
                    }
                    else if (!self.scenariosHelper.isAbleToStart(scenario)) {
                        return self.stopScenarios([scenario]);
                    }
                    else if (self.scenariosHelper.isAbleToStart(scenario) && shouldRestartBecauseOfServerUpdate) {
                        return self.reloadScenario(scenario);
                    }
                });
                let uniqueIdRunningScenarios = _.uniqWith(self.system.scenarioReader.getRunningScenarios(), (a, b) => a.model.id === b.model.id);
                uniqueIdRunningScenarios.forEach(function (readable) {
                    if (!_.find(scenarios, { id: readable.model.id })) {
                        return self.stopScenarios([readable.model]);
                    }
                });
            });
        }
        return Promise.resolve();
    }
    getLogger() {
        return this.system.logger.getLogger('ScenariosHook');
    }
    startScenario(scenario) {
        let self = this;
        return self.system.scenarioReader.startScenario(scenario)
            .catch(function (err) {
            self.logger.error("Unable to read and start scenario %s", scenario.id, err);
            return self.system.sharedApiService.createNotification("Unable to start scenario " + scenario.id + " automatically", "warning");
        });
    }
    stopScenarios(scenarios) {
        let self = this;
        scenarios.forEach(function (scenario) {
            self.logger.verbose("Trying to stop scenario %s", scenario.id);
            return self.system.scenarioReader.stopScenariosForId(scenario.id)
                .then(function () {
                self.logger.verbose("Scenarios relative to id %s are stopped and suppressed from system", scenario.id);
            })
                .catch(function (err) {
                self.logger.error("Unable to stop scenarios for id %s", scenario.id, err);
            });
        });
    }
    reloadScenario(scenario) {
        let self = this;
        self.logger.verbose("Trying to reload scenario %s", scenario.id);
        return self.system.scenarioReader.stopScenariosForId(scenario.id)
            .then(function () {
            return self.system.scenarioReader.startScenario(scenario);
        })
            .then(function () {
            self.logger.verbose("Scenario %s reloaded", scenario.id);
        })
            .catch(function (err) {
            self.logger.error("Unable to reload scenario " + scenario.id, err);
        });
    }
};

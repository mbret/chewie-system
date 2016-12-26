"use strict";
const hook_interface_1 = require("../../core/hook-interface");
const scenario_helper_1 = require("../../core/scenario/scenario-helper");
module.exports = class ScenariosHook extends hook_interface_1.Hook {
    constructor(system) {
        super(system);
        this.scenariosHelper = new scenario_helper_1.ScenarioHelper(this.system);
    }
    initialize() {
        let self = this;
        this.system.sharedApiService.io.on("scenarios:updated", function () {
            self.logger.verbose("Scenarios updated on server, try to update scenarios state");
            return updateScenarioState();
        });
        this.system.on("plugins:updated", function () {
            self.logger.verbose("The runtime plugins have been updated, try to update scenarios states..");
            return updateScenarioState();
        });
        function updateScenarioState() {
            return self.system.sharedApiService
                .getAllScenarios()
                .then(function (response) {
                let scenarios = response.body;
                if (!!scenarios.length) {
                    self.logger.verbose("%s scenario(s) found, check current state(s) and start/stop scenario(s) if needed", scenarios.length);
                    scenarios.forEach(function (scenario) {
                        if (self.scenariosHelper.isAbleToStart(scenario) && !self.system.scenarioReader.isRunning(scenario)) {
                            return self.readScenario(scenario);
                        }
                        else if (!self.scenariosHelper.isAbleToStart(scenario) && self.system.scenarioReader.isRunning(scenario)) {
                            return self.stopScenario(scenario.id);
                        }
                    });
                }
            });
        }
        return Promise.resolve();
    }
    getLogger() {
        return this.system.logger.Logger.getLogger('ScenariosHook');
    }
    readScenario(scenario) {
        let self = this;
        return self.system.scenarioReader.readScenario(scenario)
            .catch(function (err) {
            self.logger.error("Unable to read and start scenario %s", scenario.id, err);
            return self.system.sharedApiService.createNotification("Unable to start scenario " + scenario.id + " automatically", "warning");
        });
    }
    stopScenario(scenario) {
        let self = this;
        self.logger.verbose("Trying to stop scenario %s", scenario.id);
        return self.system.scenarioReader.stopScenario(scenario.id)
            .then(function () {
            self.logger.verbose("Scenario %s stopped and suppressed from system", scenario.id);
        })
            .catch(function (err) {
            self.logger.error("Unable to stop scenario", err);
        });
    }
};

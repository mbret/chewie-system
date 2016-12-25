"use strict";
const hook_interface_1 = require("../../core/hook-interface");
module.exports = (ScenariosHook_1 = class ScenariosHook extends hook_interface_1.Hook {
        initialize() {
            let self = this;
            this.system.on("ready", function () {
                self.system.sharedApiService
                    .getAllScenarios()
                    .then(function (response) {
                    let scenarios = response.body;
                    if (!scenarios.length) {
                        self.logger.verbose("There are no scenarios to load");
                    }
                    else {
                        scenarios.forEach(function (scenario) {
                            return self.readScenario(scenario);
                        });
                    }
                })
                    .catch(function (err) {
                    self.logger.warn("Unable to start scenarios automatically", err.message);
                    return self.system.sharedApiService.createNotification("Unable to start scenarios automatically", "warning");
                });
            });
            this.system.sharedApiService.io.on("scenario:created", function (scenario) {
                if (scenario.deviceId === self.system.id) {
                    return self.readScenario(scenario);
                }
            });
            this.system.sharedApiService.io.on("scenario:deleted", function (scenario) {
                if (self.system.runtime.scenarios.get(scenario.id)) {
                    self.logger.verbose("Trying to stop scenario %s", scenario.id);
                    return self.system.scenarioReader.stopScenario(scenario.id)
                        .then(function () {
                        self.logger.verbose("Scenario %s stopped and suppressed from system", scenario.id);
                    })
                        .catch(function (err) {
                        self.logger.error("Unable to stop scenario", err);
                    });
                }
            });
            return Promise.resolve();
        }
        getLogger() {
            return this.system.logger.Logger.getLogger('ScenariosHook');
        }
        readScenario(scenario) {
            let self = this;
            self.logger.verbose("Trying to run scenario %s, waiting for its plugins to be synchronized and loaded", scenario.id);
            self.waitForPlugins(self.system.scenarioReader.getPluginsIds(scenario))
                .then(function () {
                return self.system.scenarioReader.readScenario(scenario)
                    .catch(function (err) {
                    self.logger.error("Unable to read and start scenario %s", scenario.id, err);
                    return self.system.sharedApiService.createNotification("Unable to start scenario " + scenario.id + " automatically", "warning");
                });
            });
        }
        waitForPlugins(pluginIds) {
            let self = this;
            let available = false;
            return new Promise(function (resolve) {
                let interval = setInterval(function () {
                    available = true;
                    pluginIds.forEach(function (id) {
                        if (!self.system.runtime.plugins.get(id)) {
                            available = false;
                        }
                    });
                    if (available) {
                        clearInterval(interval);
                        return resolve();
                    }
                }, ScenariosHook.CHECK_PLUGINS_INTERVAL);
            });
        }
    },
    ScenariosHook_1.CHECK_PLUGINS_INTERVAL = 1000,
    ScenariosHook_1);
var ScenariosHook_1;

"use strict";

import {HookInterface, Hook} from "../../core/hook-interface";

export = class ScenariosHook extends Hook implements HookInterface, InitializeAbleInterface {

    static CHECK_PLUGINS_INTERVAL = 1000;

    initialize(){
        let self = this;

        // make sure shared api server is running
        this.system.on("ready", function() {
            self.system.sharedApiService
                .getAllScenarios()
                .then(function(response: any) {
                    let scenarios = response.body;
                    if (!scenarios.length) {
                        self.logger.verbose("There are no scenarios to load");
                    } else {
                        // run scenarios
                        scenarios.forEach(function(scenario) {
                            // Read the scenario
                            return self.readScenario(scenario);
                        });
                    }
                })
                .catch(function(err) {
                    self.logger.warn("Unable to start scenarios automatically", err.message);
                    return self.system.sharedApiService.createNotification("Unable to start scenarios automatically", "warning");
                });
        });

        // listen for new scenarios
        this.system.sharedApiService.io.on("scenario:created", function(scenario: Scenario) {
            // ensure we are on the right device
            if (scenario.deviceId === self.system.id) {
                // Read the scenario
                return self.readScenario(scenario);
            }
        });

        // listen for scenario deleted
        this.system.sharedApiService.io.on("scenario:deleted", function(scenario: Scenario) {
            // ensure we are on the right device
            if (self.system.runtime.scenarios.get(scenario.id)) {
                // Stop and delete the runtime scenario
                self.logger.verbose("Trying to stop scenario %s", scenario.id);
                return self.system.scenarioReader.stopScenario(scenario.id)
                    .then(function() {
                        self.logger.verbose("Scenario %s stopped and suppressed from system", scenario.id);
                    })
                    .catch(function(err) {
                        self.logger.error("Unable to stop scenario", err);
                    });
            }
        });

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
        self.logger.verbose("Trying to run scenario %s, waiting for its plugins to be synchronized and loaded", scenario.id);
        self.waitForPlugins(self.system.scenarioReader.getPluginsIds(scenario))
            .then(function() {
                return self.system.scenarioReader.readScenario(scenario)
                    .catch(function(err) {
                        self.logger.error("Unable to read and start scenario %s", scenario.id, err);
                        return self.system.sharedApiService.createNotification("Unable to start scenario " + scenario.id + " automatically", "warning");
                    });
            });
    }

    /**
     * Async method to wait for plugins to be loaded before reading scenarios
     * @param pluginIds
     */
    waitForPlugins(pluginIds) {
        let self = this;
        let available = false;

        return new Promise(function(resolve) {
            let interval = setInterval(function() {
                // check if plugin is loaded
                available = true;
                pluginIds.forEach(function(id) {
                    if (!self.system.runtime.plugins.get(id)) {
                        available = false;
                    }
                });
                // once available resolve promise.
                if (available) {
                    clearInterval(interval);
                    return resolve();
                }
            }, ScenariosHook.CHECK_PLUGINS_INTERVAL);
        })
    }
}
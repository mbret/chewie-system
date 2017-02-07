"use strict";
const error_1 = require("../error");
const _ = require("lodash");
const scenario_helper_1 = require("./scenario-helper");
const scenario_readable_1 = require("./scenario-readable");
const Semaphore = require('semaphore');
class ScenarioReader {
    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReader');
        this.scenarios = [];
        this.scenarioHelper = new scenario_helper_1.ScenarioHelper(this.system);
        this.semaphores = {};
    }
    isRunning(executionId) {
        let self = this;
        let semaphore = this.semaphores[executionId];
        return new Promise(function (resolve) {
            if (!semaphore) {
                return resolve(false);
            }
            else {
                semaphore.take(function () {
                    semaphore.leave();
                    return resolve(!!self.semaphores[executionId]);
                });
            }
        });
    }
    startScenario(scenario, options = {}) {
        let self = this;
        let semaphore = null;
        options = _.merge({ loadPlugins: false }, options);
        this.logger.debug("Read scenario %s", scenario.id);
        let scenarioReadable = new scenario_readable_1.default(self.system, scenario);
        semaphore = Semaphore(1);
        this.semaphores[scenarioReadable.executionId] = semaphore;
        return new Promise(function (resolve, reject) {
            semaphore.take(function () {
                Promise.resolve(null)
                    .then(function () {
                    if (options.loadPlugins) {
                        self.logger.debug("Ensure plugins are loaded or load it if needed");
                        return self.loadPlugins(scenario);
                    }
                    return Promise.resolve();
                })
                    .then(function () {
                    self.system.scenarioReader.scenarios.push(scenarioReadable);
                    return Promise.resolve()
                        .then(function () {
                        self.logger.verbose("[scenario:%s] load all nodes...", scenario.id);
                        return scenarioReadable.readNodes(scenarioReadable, scenario.nodes, { lvl: -1 });
                    })
                        .then(function () {
                        self.logger.debug("[scenario:%s] all nodes have been loaded!", scenario.id);
                        self.logger.verbose("[scenario:%s] Run the root nodes..", scenario.id);
                        return scenarioReadable.runNodes(scenario.nodes);
                    })
                        .then(function () {
                        self.logger.debug("[scenario:%s] root nodes are now running!", scenario.id);
                        self.system.emit("running-scenarios:updated");
                        let onTaskStop = () => {
                            if (!scenarioReadable.hasRunningTasks()) {
                                self.logger.verbose("[scenario:%s] event task:stop intercepted, there are no more task running, automatically stopping the scenario.", scenario.id);
                                self.stopScenario(scenarioReadable.executionId)
                                    .then(function () {
                                    scenarioReadable.removeListener("task:stop", onTaskStop);
                                })
                                    .catch(function (err) {
                                    if (err.code !== error_1.SystemError.ERROR_CODE_SCENARIO_NOT_FOUND) {
                                        self.logger.error("[scenario:%s] error while trying to stopping the scenario automatically!", scenario.id, err.message);
                                        throw err;
                                    }
                                });
                            }
                            else {
                                self.logger.verbose("[scenario:%s] event task:stop intercepted, there are still some tasks running", scenario.id);
                            }
                        };
                        scenarioReadable.on("task:stop", onTaskStop);
                        return Promise.resolve();
                    })
                        .catch(function (err) {
                        self.removeScenario(scenarioReadable);
                        throw err;
                    });
                })
                    .then(function () {
                    semaphore.leave();
                    return resolve(scenarioReadable.executionId);
                })
                    .catch(function (err) {
                    semaphore.leave();
                    return reject(err);
                });
            });
        });
    }
    stopScenariosForId(id) {
        let self = this;
        let concerned = this.scenarios.filter((tmp) => tmp.model.id === id);
        let promises = [];
        concerned.forEach(function (readable) {
            promises.push(self.stopScenario(readable.executionId)
                .catch(function (err) {
                if (err.code !== error_1.SystemError.ERROR_CODE_SCENARIO_NOT_FOUND) {
                    throw err;
                }
            }));
        });
        return Promise.all(promises);
    }
    stopScenario(executionId) {
        let self = this;
        let semaphore = this.semaphores[executionId];
        return new Promise(function (resolve, reject) {
            if (!semaphore) {
                return reject(new error_1.SystemError(executionId + " not running", error_1.SystemError.ERROR_CODE_SCENARIO_NOT_FOUND));
            }
            else {
                semaphore.take(function () {
                    let scenario = self.scenarios.find((elt) => elt.executionId === executionId);
                    if (!scenario) {
                        semaphore.leave();
                        return reject(new error_1.SystemError(executionId + " not running", error_1.SystemError.ERROR_CODE_SCENARIO_NOT_FOUND));
                    }
                    self.logger.verbose("Stopping scenario %s (execution id %s) ...", scenario.model.id, scenario.executionId);
                    return scenario
                        .stop()
                        .then(function () {
                        self.logger.debug("scenario %s (execution id %s) stopped!", scenario.model.id, scenario.executionId);
                        self.system.emit("running-scenarios:updated");
                    })
                        .then(function () {
                        self.removeScenario(scenario);
                        semaphore.leave();
                        delete self.semaphores[executionId];
                        return resolve();
                    })
                        .catch(function (err) {
                        semaphore.leave();
                        return reject(err);
                    });
                });
            }
        });
    }
    getRunningScenarios() {
        return this.scenarios;
    }
    removeScenario(scenarioReadable) {
        let index = this.scenarios.indexOf(scenarioReadable);
        return this.scenarios.splice(index, 1);
    }
    loadPlugins(scenario) {
        let self = this;
        let ids = self.scenarioHelper.getPluginsIds(scenario);
        let promises = [];
        ids.forEach(function (id) {
            promises.push(self.system.sharedApiService
                .getPlugin(id)
                .then(function (plugin) {
                return self.system.pluginsLoader.load(plugin)
                    .catch(function (err) {
                    if (err.code === error_1.SystemError.ERROR_CODE_PLUGIN_ALREADY_LOADED) {
                        return Promise.resolve();
                    }
                    throw err;
                });
            }));
        });
        return Promise.all(promises);
    }
}
exports.ScenarioReader = ScenarioReader;
//# sourceMappingURL=scenario-reader.js.map
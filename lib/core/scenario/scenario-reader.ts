"use strict";
import {System} from "../../system";
import {ModuleContainer} from "../plugins/modules/module-container";
import {SystemError} from "../error";
import {ScenarioModel} from "../../hooks/shared-server-api/lib/models/scenario";
import * as _ from "lodash";
import {ScenarioHelper} from "./scenario-helper";
import ScenarioReadable from "./scenario-readable";
const Semaphore = require('semaphore');

/**
 * @todo pour le moment tout est instancié au début de la lecture. Au besoin une demande de trigger/task est envoyé à l'instance.
 * @todo on pourrait imaginer instancier un module uniquement à la volée et le detruire ensuite. Il faut juste vérifier que l'instance éxiste ou non au besoin
 */
export class ScenarioReader {

    protected system: System;
    protected logger: any;
    protected scenarios: Array<ScenarioReadable>;
    protected scenarioHelper: ScenarioHelper;
    protected semaphores: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReader');
        this.scenarios = [];
        this.scenarioHelper = new ScenarioHelper(this.system);
        this.semaphores = {};
    }

    public isRunning(executionId: string) {
        let self = this;
        let semaphore = this.semaphores[executionId];

        return new Promise(function(resolve) {
            if (!semaphore) {
                return resolve(false);
            } else {
                semaphore.take(function() {
                    semaphore.leave();
                    return resolve(!!self.semaphores[executionId]);
                });
            }
        });
    }

    /**
     * Read a scenario from data.
     * Scenario once read are never removed from runtime, even if it is done.
     * It could be occurs when a trigger is one-time. A scenario is either active or inactive.
     *
     * @param scenario
     * @param options
     */
    public startScenario(scenario: ScenarioModel, options: any = {}) {
        let self = this;
        let semaphore = null;
        options = _.merge({ loadPlugins: false }, options);

        this.logger.debug("Read scenario %s", scenario.id);

        // create a new runtime scenario
        let scenarioReadable = new ScenarioReadable(self.system, scenario);
        // we use the execution id to create a semaphore lock
        semaphore = Semaphore(1);
        this.semaphores[scenarioReadable.executionId] = semaphore;

        // semaphore lock
        return new Promise(function(resolve, reject) {
            semaphore.take(function() {
                Promise.resolve(null)
                    // Ensure plugins are loaded if option is set
                    .then(function() {
                        if (options.loadPlugins) {
                            self.logger.debug("Ensure plugins are loaded or load it if needed");
                            return self.loadPlugins(scenario);
                        }
                        return Promise.resolve();
                    })
                    .then(function() {
                        // register scenario in runtime
                        // it prevent running more than once and also help dealing through the system
                        self.system.scenarioReader.scenarios.push(scenarioReadable);

                        return Promise.resolve()
                            // execute each node
                            .then(function() {
                                self.logger.verbose("[scenario:%s] load all nodes...", scenario.id);
                                return scenarioReadable.readNodes(scenarioReadable, scenario.nodes, { lvl: -1 });
                            })
                            // Once they are all registered and loaded
                            // we run the first root trigger and tasks
                            .then(function() {
                                self.logger.debug("[scenario:%s] all nodes have been loaded!", scenario.id);
                                self.logger.verbose("[scenario:%s] Run the root nodes..", scenario.id);
                                return scenarioReadable.runNodes(scenario.nodes);
                            })
                            .then(function() {
                                self.logger.debug("[scenario:%s] root nodes are now running!", scenario.id);
                                self.system.emit("running-scenarios:updated");

                                // function on event task:stop
                                // We check if the scenario should stop
                                let onTaskStop = () => {
                                    if (!scenarioReadable.hasRunningTasks()) {
                                        // no more running task, we should stop the scenario
                                        self.logger.verbose("[scenario:%s] event task:stop intercepted, there are no more task running, automatically stopping the scenario.", scenario.id);
                                        self.stopScenario(scenarioReadable.executionId)
                                            .then(function() {
                                                scenarioReadable.removeListener("task:stop", onTaskStop);
                                            })
                                            .catch(function(err) {
                                                if (err.code !== SystemError.ERROR_CODE_SCENARIO_NOT_FOUND) {
                                                    self.logger.error("[scenario:%s] error while trying to stopping the scenario automatically!", scenario.id, err.message);
                                                    throw err;
                                                }
                                            });
                                    } else {
                                        self.logger.verbose("[scenario:%s] event task:stop intercepted, there are still some tasks running", scenario.id);
                                    }
                                };
                                // listen for the last task being ran and stop the scenario if needed
                                scenarioReadable.on("task:stop", onTaskStop);

                                return Promise.resolve();
                            })
                            //as soon an error occurs we remove the scenario. A scenario is either running well or not.
                            .catch(function(err) {
                                // self.logger.error("An error occurred while reading scenario %s", scenario.name, err);
                                self.removeScenario(scenarioReadable);
                                throw err;
                            });
                    })
                    .then(function() {
                        semaphore.leave();
                        return resolve(scenarioReadable.executionId);
                    })
                    .catch(function(err) {
                        semaphore.leave();
                        return reject(err);
                    });
            });
        });
    }

    /**
     * Stop all scenario relative to this id.
     * @param id
     */
    public stopScenariosForId(id) {
        let self = this;
        let concerned = this.scenarios.filter((tmp) => tmp.model.id === id);
        let promises = [];
        concerned.forEach(function(readable) {
            promises.push(self.stopScenario(readable.executionId)
                // ignore already stopped scenario
                .catch(function(err) {
                    if (err.code !== SystemError.ERROR_CODE_SCENARIO_NOT_FOUND) {
                        throw err;
                    }
                }));
        });

        return Promise.all(promises);
    }

    public stopScenario(executionId: string) {
        let self = this;
        let semaphore = this.semaphores[executionId];

        return new Promise(function(resolve, reject) {
            if (!semaphore) {
                return reject(new SystemError(executionId + " not running", SystemError.ERROR_CODE_SCENARIO_NOT_FOUND));
            } else {
                semaphore.take(function() {
                    // retrieve scenario
                    let scenario = self.scenarios.find((elt) => elt.executionId === executionId);
                    if (!scenario) {
                        semaphore.leave();
                        return reject(new SystemError(executionId + " not running", SystemError.ERROR_CODE_SCENARIO_NOT_FOUND));
                    }
                    self.logger.verbose("Stopping scenario %s (execution id %s) ...", scenario.model.id, scenario.executionId);
                    return scenario
                        .stop()
                        .then(function() {
                            self.logger.debug("scenario %s (execution id %s) stopped!", scenario.model.id, scenario.executionId);
                            self.system.emit("running-scenarios:updated");
                        })
                        .then(function() {
                            self.removeScenario(scenario);
                            semaphore.leave();
                            delete self.semaphores[executionId];
                            return resolve();
                        })
                        .catch(function(err) {
                            semaphore.leave();
                            return reject(err);
                        });
                });
            }
        });
    }

    public getRunningScenarios(): Array<ScenarioReadable> {
        return this.scenarios;
    }

    protected removeScenario(scenarioReadable: ScenarioReadable) {
        let index = this.scenarios.indexOf(scenarioReadable);
        return this.scenarios.splice(index, 1);
    }

    protected loadPlugins(scenario: ScenarioModel) {
        let self = this;
        // get a list of concerned plugins
        let ids = self.scenarioHelper.getPluginsIds(scenario);
        let promises = [];
        // load every plugins related to scenarios
        ids.forEach(function(id) {
            promises.push(
                self.system.sharedApiService
                    .getPlugin(id)
                    .then(function(plugin) {
                        return self.system.pluginsLoader.load(plugin)
                            .catch(function(err) {
                                if (err.code === SystemError.ERROR_CODE_PLUGIN_ALREADY_LOADED) {
                                    return Promise.resolve();
                                }
                                throw err;
                            });
                    })
            )
        });
        return Promise.all(promises);
    }
}
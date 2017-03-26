"use strict";
import {System} from "../../system";
import {SystemError} from "../error";
import {ScenarioModel} from "../../hooks/shared-server-api/lib/models/scenario";
import * as _ from "lodash";
import {ScenarioHelper} from "./scenario-helper";
import ScenarioReadable from "./scenario-readable";
import {PluginsLoader} from "../plugins/plugins-loader";
const Semaphore = require('semaphore');
import {debug as hookDebug} from "../../shared/debug";
import {PluginContainer} from "../plugins/plugin-container";
let debug = hookDebug("scenarios:reader");
// let queue = require('queue');

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
    protected pluginsLoader: PluginsLoader;
    public ingredientsInjectionQueue: Array<Function>;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReader');
        this.scenarios = [];
        this.scenarioHelper = new ScenarioHelper(this.system);
        this.semaphores = {};
        this.pluginsLoader = new PluginsLoader(system);
        this.ingredientsInjectionQueue = [];
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

        this.logger.debug("Start new execution for scenario %s", scenario.id);

        // create a new runtime scenario
        let scenarioReadable = new ScenarioReadable(self.system, scenario);
        // we use the execution id to create a semaphore lock
        semaphore = Semaphore(1);
        this.semaphores[scenarioReadable.executionId] = semaphore;

        // register scenario in runtime
        self.system.scenarioReader.scenarios.push(scenarioReadable);

        // semaphore lock
        return new Promise(function(resolve, reject) {
            semaphore.take(function() {
                Promise.resolve(null)
                    // Ensure plugins are loaded if option is set
                    // After that part if the plugins are not mounted it means they have been stopped after scenario start
                    // so we should not continue starting scenario
                    .then(function() {
                        self.logger.debug("Ensure plugins are loaded or load it if needed");
                        return self.loadPlugins(scenario);
                    })
                    .then(function(plugins: Array<PluginContainer>) {
                        return Promise.resolve()
                            // execute each node
                            // Once they are all registered and loaded
                            // we run the first root trigger and tasks
                            .then(function() {
                                return self.getRuntimeIngredients()
                                    .then(function(ingredients) {
                                        return scenarioReadable.start(ingredients);
                                    });
                            })
                            .then(function() {
                                self.logger.debug("[scenario:%s] root nodes are now running!", scenario.id);
                                self.system.emit("running-scenarios:updated");

                                // function on event task:stop
                                // We check if the scenario should stop
                                let onTaskStop = function() {
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
                                }
                                // listen for the last task being ran and stop the scenario if needed
                                scenarioReadable.on("task:stop", onTaskStop);

                                return Promise.resolve();
                            });
                    })
                    .then(function() {
                        semaphore.leave();
                        return resolve(scenarioReadable);
                    })
                    // as soon an error occurs we stop the scenario. A scenario is either running well or not.
                    // By stopping the scenario inside the startup semaphore we are sure no one else will do something between. The stop will start immedialty
                    // after we release the semaphore
                    .catch(function(err) {
                        self.stopScenario(scenarioReadable.executionId)
                            .then(() => {})
                            .catch(() => {});
                        semaphore.leave();
                        return reject(err);
                    });
            });
        });
    }

    /**
     * @param executionId
     * @param options
     * @returns {Promise}
     */
    public stopScenario(executionId: string, options: any = {}): Promise<any> {
        let self = this;

        // no scenario
        if (!self.scenarios.find((elt) => elt.executionId === executionId)) {
            if (options.silent) {
                return Promise.resolve();
            } else {
                return Promise.reject(new SystemError(executionId + " not running", SystemError.ERROR_CODE_SCENARIO_NOT_FOUND));
            }
        }

        // scenario exist so we should have a semaphore
        let semaphore = this.semaphores[executionId];

        return (new Promise(function(resolve, reject) {
            semaphore.take(function() {
                let scenario = self.scenarios.find((elt) => elt.executionId === executionId);

                // scenario has been stopped already
                // this scenario may occurs if start() failed and stopped the scenario automatically
                if (!scenario) {
                    return resolve();
                }

                // scenario may still be initializing so we remove it from the take() to ensure we are synchronized
                let index = self.scenarios.indexOf(scenario);
                self.scenarios.splice(index, 1);
                self.logger.verbose("Stopping scenario %s (execution id %s) ...", scenario.model.id, scenario.executionId);
                return scenario
                    .stop()
                    .then(function() {
                        semaphore.leave();
                        self.logger.debug("scenario [%s] relative to scenario [%s] stopped and removed from runtime!", scenario.executionId, scenario.model.id);
                        self.system.emit("running-scenarios:updated");
                        delete self.semaphores[executionId];
                        return resolve();
                    })
                    .catch(reject);
            });
        })).catch(function(err) {
            semaphore.leave();
            throw err;
        });
    }

    public getScenarios(): Array<ScenarioReadable> {
        return this.scenarios;
    }

    public getRuntimeIngredients() {
        return Promise.all(this.ingredientsInjectionQueue.map((fn) => fn()))
            .then(function(results) {
                let res = {};
                results.forEach((ingredients) => res = _.merge(ingredients, res));
                return res;
            });
    }

    protected loadPlugins(scenario: ScenarioModel) {
        let self = this;
        // get a list of concerned plugins
        let ids = self.scenarioHelper.getPluginsNames(scenario);
        let promises = [];
        debug("Need to load plugins [%s] in order to start scenario %s", ids, scenario.id);
        // load every plugins related to scenarios
        ids.forEach(function(id) {
            promises.push(
                self.system.sharedApiService
                    .getPlugin(id)
                    .then(function(plugin) {
                        if (!plugin) {
                            throw new SystemError("Plugin " + id + " does not exist, the scenario can not be started.", SystemError.ERROR_CODE_PLUGIN_MISSING);
                        }
                        return self.pluginsLoader.mount(plugin);
                    })
            )
        });
        return Promise.all(promises);
    }
}
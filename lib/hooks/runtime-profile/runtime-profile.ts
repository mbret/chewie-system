"use strict";

let async = require("async");
let self = this;
import * as _ from "lodash";
import {Hook} from "../../core/hook";
import {Daemon} from "../../daemon";

export class RuntimeProfileHook implements Hook {

    system: Daemon;
    logger: any;
    currentProfile: any;

    constructor(system: Daemon) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('RuntimeProfileHook');
        this.currentProfile = null;
    }

    initialize(done: Function) {

        // Try to start profile if one is defined on startup
        // let profileToLoad = self.config.profileToLoadOnStartup;
        // if(profileToLoad) {
            self.system.runtime.profileManager.startProfile("admin")
                .then(function(){
                    self.logger.info("Profile %s has been started", "admin");
                })
                .catch(function(err) {
                    self.logger.info("Unable to start profile", "admin", err);
                });
        // }

        // System events
        this.system
            .on("profile:start", function(profile) {
                self.currentProfile = profile;
                let plugins = null;

                // We have to run all the scenario user
                // To do that we need the user modules to be sync inside system
                Promise
                    // So first fetch all user plugins
                    .resolve(self.system.apiService.findAllPluginsByUser(profile.id))
                    // Now synchronize
                    .then(function(data) {
                        plugins = data;
                        return self.synchronizePlugins(plugins);
                    })
                    // Load the plugins
                    .then(function() {
                        return self.loadPlugins(plugins);
                    })
                    // Now fetch all scenario
                    .then(function() {
                        return self.system.apiService.findAllScenario(profile.id);
                    })
                    // Now run all scenario
                    .then(function(scenarios) {
                        scenarios.forEach(function(scenario) {
                            // Read the scenario
                            self.system.scenarioReader.readScenario(scenario)
                                .catch(function() {});
                        });

                        return Promise.resolve();
                    })
                    .then(function() {
                        self.logger.debug("Task on event profile:start completed with success")
                    })
                    .catch(function(err) {
                        self.logger.error("Task on event profile:start failed", err);
                        // @todo for now just shutdown but maybe we could rollback user load ?
                        self.system.shutdown();
                    });
            })
            .on("profile:stop", function() {
                // self.currentProfile = null;
                // var activeProfile = self.system.runtime.profileManager.getActiveProfile().id;
                //
                // var tasksIds = Array.from(self.system.tasksMap.keys());
                //
                // // Clean up tasks
                // async.map(tasksIds, function(id, cbTask){
                //     self.system.logger.debug('clean up task %s', id);
                //     self.system.runtime.unregisterTask(id);
                //     return cbTask();
                // }, function(err){
                //     if(err) {
                //         return cb(err);
                //     }
                //     async.parallel([
                //         // clean up screen modules
                //         function(cb2) {
                //             self.system.logger.debug('Cleaning and destroying screens modules ...');
                //             async.each(self.system.runtime.modules.values(), function(container, cb) {
                //                 self.system.webServer.destroyScreen(container, cb);
                //             }, cb2);
                //         },
                //         // clean up modules
                //         function(cb2) {
                //             var promises = [];
                //             for (let module of self.system.runtime.modules) {
                //                 self.system.logger.verbose("Destroying module %s", module.name);
                //                 promises.push(module.destroy());
                //             }
                //             Promise.all(promises)
                //                 .then(function() {
                //                     self.system.logger.verbose("All modules has been destroyed");
                //                     self.system.runtime.modules.clear();
                //                     cb2();
                //                 })
                //                 .catch(function() { cb2(); });
                //         },
                //         // clean up plugins
                //         function(cb2) {
                //             self.system.plugins.clear();
                //             return cb2();
                //         }
                //     ], cb);
                // });
            });

        // Remote & shared events
        this.system.communicationBus
            .on("user:plugin:created", function(plugin) {
                if (self.currentProfile && plugin.userId === self.currentProfile.id) {
                    self
                        .synchronizePlugins([plugin])
                        .then(function() {
                            return self.loadPlugins([plugin]);
                        });
                }
            })
            .on("user:plugin:deleted", function(plugin) {
                if (self.currentProfile && plugin.userId === self.currentProfile.id) {
                    self.unLoadPlugins([plugin]);
                }
            })
            .on("user:scenario:created", function(scenario) {
                if (self.currentProfile && scenario.userId === self.currentProfile.id) {
                    // Read the scenario
                    self.system.scenarioReader.readScenario(scenario)
                        .catch(function(err) {
                            self.logger.error("Unable to read scenario", err);
                        });
                }
            })
            .on("scenario:deleted", function(scenario) {
                if (self.currentProfile) {
                    // Stop and delete the runtime scenario
                    self.system.scenarioReader.stopScenario(scenario.id)
                        .catch(function(err) {
                            self.logger.error("Unable to stop scenario", err);
                        });
                }
            });

        return done();
    }

    /**
     * - copy plugins to local dir
     * @param plugins
     * @returns {any}
     */
    synchronizePlugins(plugins) {
        this.logger.verbose('Synchronizing plugins [%s]', _.map(plugins, "name"));
        return this.system.repository.synchronize(plugins)
    }

    /**
     * - load the plugin
     * - attach a reference to system
     * @param plugins
     * @returns {any}
     */
    loadPlugins(plugins) {
        self.logger.verbose('Loading plugins [%s]', _.map(plugins, "name"));
        var promises = [];
        plugins.forEach(function(plugin) {
            promises.push(
                self.system.pluginsLoader
                    .load(plugin)
                    .then(function(container) {
                        // add to global storage
                        self.system.runtime.plugins.set(container.plugin.name, container);
                        return Promise.resolve();
                    })
            );
        });
        return Promise.all(promises);
    }

    /**
     * - remove the reference of plugin to the system
     * @param plugins
     */
    unLoadPlugins(plugins) {
        this.logger.verbose('Unloading plugins [%s]', _.map(plugins, "name"));
        plugins.forEach(function(plugin) {
            self.system.runtime.plugins.delete(plugin.name);
        });
    }
}
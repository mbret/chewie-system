"use strict";

import {Daemon} from "../daemon";
import {Hook} from "../core/hook";
var async = require("async");
var self = this;

export class RuntimeProfileHook implements Hook {

    system: Daemon;
    logger: any;

    constructor(system: Daemon) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('RuntimeProfileHook');
    }

    initialize(done: Function) {

        this.system.on("profile:start", function(profile) {

            var plugins = null;

            // We have to run all the scenario user
            // To do that we need the user modules to be sync inside system
            Promise
                // So first fetch all user plugins
                .resolve(self.system.apiService.findAllPluginsByUser(profile.id))
                // Now synchronize
                .then(function(data) {
                    plugins = data;
                    self.system.logger.verbose('Synchronizing plugins..');
                    return self.system.repository.synchronize(plugins)
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
                });
        });

        // On current profile to stop
        this.system.registerTask('profile:stop', function(cb){

            var activeProfile = self.system.runtimeHelper.profile.getActiveProfile().id;

            var tasksIds = Array.from(self.system.tasksMap.keys());

            // Clean up tasks
            async.map(tasksIds, function(id, cbTask){
                self.system.logger.debug('clean up task %s', id);
                self.system.runtimeHelper.unregisterTask(id);
                return cbTask();
            }, function(err){
                if(err) {
                    return cb(err);
                }
                async.parallel([
                    // clean up screen modules
                    function(cb2) {
                        self.system.logger.debug('Cleaning and destroying screens modules ...');
                        async.each(self.system.modules.values(), function(container, cb) {
                            self.system.webServer.destroyScreen(container, cb);
                        }, cb2);
                    },
                    // clean up modules
                    function(cb2) {
                        var promises = [];
                        for (let module of self.system.modules) {
                            self.system.logger.verbose("Destroying module %s", module.name);
                            promises.push(module.destroy());
                        }
                        Promise.all(promises)
                            .then(function() {
                                self.system.logger.verbose("All modules has been destroyed");
                                self.system.modules.clear();
                                cb2();
                            })
                            .catch(function() { cb2(); });
                    },
                    // clean up plugins
                    function(cb2) {
                        self.system.plugins.clear();
                        return cb2();
                    }
                ], cb);
            });
        });

        return done();
    }
}
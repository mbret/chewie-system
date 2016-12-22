"use strict";
let async = require("async");
let self = this;
const _ = require("lodash");
module.exports = class RuntimeProfileHook {
    constructor(system) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('RuntimeProfileHook');
        this.currentProfile = null;
    }
    initialize() {
        this.system
            .on("profile:start", function (profile) {
            self.currentProfile = profile;
            let plugins = null;
            Promise
                .resolve(self.system.sharedApiService.findAllPluginsByUser(profile.id))
                .then(function (data) {
                plugins = data;
                return self.synchronizePlugins(plugins);
            })
                .then(function () {
                return self.loadPlugins(plugins);
            })
                .then(function () {
                return self.system.sharedApiService.findAllScenario(profile.id);
            })
                .then(function (scenarios) {
                scenarios.forEach(function (scenario) {
                    self.system.scenarioReader.readScenario(scenario)
                        .catch(function () { });
                });
                return Promise.resolve();
            })
                .then(function () {
                self.logger.debug("Task on event profile:start completed with success");
            })
                .catch(function (err) {
                self.logger.error("Task on event profile:start failed", err);
                self.system.shutdown();
            });
        })
            .on("profile:stop", function () {
        });
        this.system.communicationBus
            .on("user:plugin:created", function (plugin) {
            if (self.currentProfile && plugin.userId === self.currentProfile.id) {
                self
                    .synchronizePlugins([plugin])
                    .then(function () {
                    return self.loadPlugins([plugin]);
                });
            }
        })
            .on("user:plugin:deleted", function (plugin) {
            if (self.currentProfile && plugin.userId === self.currentProfile.id) {
                self.unLoadPlugins([plugin]);
            }
        })
            .on("user:scenario:created", function (scenario) {
            if (self.currentProfile && scenario.userId === self.currentProfile.id) {
                self.system.scenarioReader.readScenario(scenario)
                    .catch(function (err) {
                    self.logger.error("Unable to read scenario", err);
                });
            }
        })
            .on("scenario:deleted", function (scenario) {
            if (self.currentProfile) {
                self.system.scenarioReader.stopScenario(scenario.id)
                    .catch(function (err) {
                    self.logger.error("Unable to stop scenario", err);
                });
            }
        });
        this.system.sharedApiServer.on("initialized", function () {
            self.system.runtime.profileManager.startProfile("admin")
                .then(function () {
                self.logger.info("Profile %s has been started", "admin");
            })
                .catch(function (err) {
                self.logger.error("An error occurred while trying to start profile %s", "admin");
                throw err;
            });
        });
        return Promise.resolve();
    }
    synchronizePlugins(plugins) {
        this.logger.verbose('Synchronizing plugins [%s]', _.map(plugins, "name"));
        return this.system.repository.synchronize(plugins);
    }
    loadPlugins(plugins) {
        self.logger.verbose('Loading plugins [%s]', _.map(plugins, "name"));
        let promises = [];
        plugins.forEach(function (plugin) {
            promises.push(self.system.pluginsLoader
                .load(plugin)
                .then(function (container) {
                self.system.runtime.plugins.set(container.plugin.name, container);
                return Promise.resolve();
            }));
        });
        return Promise.all(promises);
    }
    unLoadPlugins(plugins) {
        this.logger.verbose('Unloading plugins [%s]', _.map(plugins, "name"));
        plugins.forEach(function (plugin) {
            self.system.runtime.plugins.delete(plugin.name);
        });
    }
};

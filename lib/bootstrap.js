'use strict';
var runtime_profile_hook_1 = require("./hooks/runtime-profile-hook");
var async = require('async');
var util = require('util');
var path = require('path');
var DefaultTextToSpeechAdapter = require(CORE_DIR + '/speaker').DefaultTextToSpeechAdapter;
var self = this;
var clientWebServer = require("./client-web-server/server");
var Bootstrap = (function () {
    function Bootstrap(system) {
        self = this;
        this.system = system;
    }
    /**
     *
     * @param done
     */
    Bootstrap.prototype.bootstrap = function (done) {
        // register hooks
        this.system.hooksToLoad.push(runtime_profile_hook_1.RuntimeProfileHook);
        Promise
            .all([
            new Promise(function (resolve, reject) {
                // run old bootstrap
                self._oldBootstrap(self.system, self.system.logger, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            }),
            self._loadHooks(),
            self._startWebServer()
        ])
            .then(done.bind(self, null))
            .catch(done);
    };
    /**
     *
     * @returns {any}
     * @private
     */
    Bootstrap.prototype._loadHooks = function () {
        var self = this;
        var promises = [];
        this.system.hooksToLoad.forEach(function (Module) {
            var hook = new Module(self.system);
            promises.push(new Promise(function (resolve, reject) {
                hook.initialize(function (err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            }));
        });
        return Promise.all(promises);
    };
    Bootstrap.prototype._startWebServer = function () {
        return clientWebServer(this.system);
    };
    Bootstrap.prototype._oldBootstrap = function (system, logger, bootstrapDone) {
        async.series([
            // Use daemon as a bridge to pass some events
            // It may more easy to catch elsewhere
            function (done) {
                system.apiServer.on("initialized", function () { setImmediate(function () { system.emit('api-server:initialized'); }); });
                return done();
            },
            // Initialize api & web server.
            function (done) {
                async.parallel([
                    // Start api server
                    function (cb) {
                        system.apiServer.initialize(cb);
                    },
                ], done);
            },
            // Initialize some final stuff
            function (done) {
                async.parallel([
                    // Register default speaker adapter
                    // The speaker adapter is the bridge between system speaker class and hardware
                    // It is possible to not set an adapter (some system do not need it). In this case
                    // the speaker will always return fake sound that are completed and closed directly. It does not
                    // break code.
                    //function(cb){
                    //    var config = system.config.system.speakerAdapter;
                    //    if(config === null) {
                    //        logger.warn('No speaker adapter set. You will not have any audio output.');
                    //        return cb();
                    //    }
                    //    var SpeakerAdapter = config.module;
                    //    system.speaker.registerSpeakerAdapter(new SpeakerAdapter(system, config.options), cb);
                    //},
                    // Register default text to speech adapter
                    // This adapter is supposed to transform text into sound file
                    function (cb) {
                        system.speaker.registerTextToSpeechAdapter(DefaultTextToSpeechAdapter, cb);
                    },
                    // Listen the orm events bus
                    // The orm bus act as a link to update runtime plugins/modules/etc whenever
                    // something in database is updated and should be reflected in runtime.
                    function (cb) {
                        // Listen for plugins update
                        // In this case we need to update the possible runtime plugins
                        system.on('orm:plugins:updated', function (plugin) {
                            // check if a plugin with taht name (and belong to the user) is registered
                            if (system.plugins.has(plugin.name) && system.runtimeHelper.profile.getActiveProfileId() === plugin.userId) {
                                // Then we need to update its user options
                                system.plugins.get(plugin.name).setOptions(plugin.get('userOptions'));
                            }
                        });
                        // Listen for user update
                        // We need to update the active profile to keep for example the user config
                        // up to date.
                        system.on('orm:user:updated', function (user) {
                            if (system.runtimeHelper.profile.getActiveProfile().id === user.get('id')) {
                                system.runtimeHelper.profile.setActiveProfile(user.toJSON());
                            }
                        });
                        return cb();
                    },
                    // Listen the communication bus
                    function (cb) {
                        // Listen for new task being created
                        system.bus.on('task:created', function (task) {
                            // Run task if a profile is loaded + check if task user = profile
                            // No need to be sync, task is ran in background
                            if (system.runtimeHelper.profile.hasActiveProfile()) {
                                system.runtimeHelper.registerTask(task, function (err) {
                                    if (err) {
                                        if (err.moduleNotLoaded) {
                                            system.logger.warn(err.message);
                                        }
                                        else {
                                            system.logger.error("An error occurred when registering the task %s", task.id, err);
                                        }
                                        return;
                                    }
                                    system.notificationService.push('success', util.format('Task %s registered for the running profile', task.id));
                                });
                            }
                        });
                        return cb();
                    },
                    function (cb) {
                        system.serverSocketEventsListener.initialize(cb);
                    },
                ], done);
            },
        ], function (err) {
            return bootstrapDone(err);
        });
    };
    return Bootstrap;
}());
exports.Bootstrap = Bootstrap;

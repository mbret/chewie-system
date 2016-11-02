'use strict';
import {Daemon} from "./daemon";
import {RuntimeProfileHook} from "./hooks/runtime-profile/runtime-profile";
import {ClientWebServer} from "./hooks/client-web-server/server";
var async = require('async');
var util = require('util');
var path = require('path');
var DefaultTextToSpeechAdapter = require('./core/speaker').DefaultTextToSpeechAdapter;
var self = this;

export class Bootstrap {

    system: Daemon;

    constructor(system) {
        self = this;
        this.system = system;
    }

    /**
     *
     * @param done
     */
    bootstrap(done) {

        // register hooks
        this.system.hooksToLoad.push(RuntimeProfileHook);
        this.system.hooksToLoad.push(ClientWebServer);

        Promise
            .all([
                new Promise(function(resolve, reject) {
                    // run old bootstrap
                    self._oldBootstrap(self.system, self.system.logger, function(err) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve();
                    });
                }),
                self._loadHooks(),
            ])
            .then(done.bind(self, null))
            .catch(done);
    }

    /**
     *
     * @returns {any}
     * @private
     */
    _loadHooks() {
        var self = this;
        var promises = [];
        this.system.hooksToLoad.forEach(function(Module) {
            var hook = new Module(self.system);
            promises.push(new Promise(function(resolve, reject) {
                hook.initialize(function(err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            }));
        });

        return Promise.all(promises);
    }

    _oldBootstrap(system, logger, bootstrapDone){

        async.series([

            // Use daemon as a bridge to pass some events
            // It may more easy to catch elsewhere
            function(done) {
                system.apiServer.on("initialized", function() { setImmediate(function() { system.emit('api-server:initialized'); }) });
                return done();
            },

            // Initialize api & web server.
            function(done){
                async.parallel([
                    // Start api server
                    function(cb){
                        system.apiServer.initialize(cb);
                    },
                    // Start web server
                    //function(cb){
                    //    system.webServer.initialize(cb);
                    //}
                ], done);
            },

            // Initialize some final stuff
            function(done){
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
                    function(cb){
                        system.speaker.registerTextToSpeechAdapter(DefaultTextToSpeechAdapter, cb);
                    },

                    // Listen the orm events bus
                    // The orm bus act as a link to update runtime plugins/modules/etc whenever
                    // something in database is updated and should be reflected in runtime.
                    function(cb){

                        // Listen for plugins update
                        // In this case we need to update the possible runtime plugins
                        system.on('orm:plugins:updated', function(plugin){

                            // check if a plugin with taht name (and belong to the user) is registered
                            if(system.plugins.has(plugin.name) && system.runtimeHelper.profile.getActiveProfileId() === plugin.userId){
                                // Then we need to update its user options
                                system.plugins.get(plugin.name).setOptions(plugin.get('userOptions'));
                            }
                        });

                        // Listen for user update
                        // We need to update the active profile to keep for example the user config
                        // up to date.
                        system.on('orm:user:updated', function(user){

                            if(system.runtimeHelper.profile.getActiveProfile().id === user.get('id')){
                                system.runtimeHelper.profile.setActiveProfile(user.toJSON());
                            }
                        });

                        return cb();
                    },

                    // Listen the communication bus
                    function(cb) {

                        // Listen for new task being created
                        system.bus.on('task:created', function(task) {
                            // Run task if a profile is loaded + check if task user = profile
                            // No need to be sync, task is ran in background
                            if(system.runtimeHelper.profile.hasActiveProfile()){
                                system.runtimeHelper.registerTask(task, function(err){
                                    if(err){
                                        if(err.moduleNotLoaded) {
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

                    function(cb) {
                        system.communicationBus.initialize(cb);
                    },

                ], done);
            },
        ], function(err){
            return bootstrapDone(err);
        });
    }
}

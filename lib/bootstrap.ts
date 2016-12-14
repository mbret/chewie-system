'use strict';
import {Daemon} from "./daemon";
let async = require('async');
let util = require('util');
let path = require('path');
let self = this;

export class Bootstrap {

    system: Daemon;
    logger: any;

    constructor(system) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('Bootstrap');
    }

    /**
     *
     * @param done
     */
    bootstrap(done) {

        // register hooks (for now only core)
        this.system.hooksToLoad.push("runtime-profile");
        this.system.hooksToLoad.push("client-web-server");

        Promise
            .all([
                self.system.speaker.initialize(),
                self._oldBootstrap(),
                self.system.sharedApiServer.initialize(),
                self._loadStorage(),
                self._loadHooks(),
            ])
            .then(done.bind(self, null))
            .catch(done);
    }

    /**
     * @returns {Object}
     * @private
     */
    _loadHooks() {
        let self = this;
        let promises = [];
        this.system.hooksToLoad.forEach(function(moduleName) {
            let Module = require("./hooks/" + moduleName);
            let hook = new Module(self.system);
            promises.push(new Promise(function(resolve, reject) {
                hook.initialize(function(err) {
                    if (err) {
                        return reject(err);
                    }
                    self.logger.debug("Hook %s initialized", moduleName);
                    setImmediate(function() {
                        self.system.emit("hook:" + moduleName + ":initialized");
                    });
                    return resolve();
                });
            }));
        });

        return Promise.all(promises);
    }

    _loadStorage() {
        return this.system.storage.initialize()
            .then(function() {
                self.logger.debug("Storage initialized");
            });
    }

    _oldBootstrap(){
        let system = this.system;
        return new Promise(function(resolve, reject) {
            async.series([

                // Initialize some final stuff
                function(done){
                    async.parallel([

                        // Register default speaker adapter
                        // The speaker adapter is the bridge between system speaker class and hardware
                        // It is possible to not set an adapter (some system do not need it). In this case
                        // the speaker will always return fake sound that are completed and closed directly. It does not
                        // break code.
                        //function(cb){
                        //    let config = system.config.system.speakerAdapter;
                        //    if(config === null) {
                        //        logger.warn('No speaker adapter set. You will not have any audio output.');
                        //        return cb();
                        //    }
                        //    let SpeakerAdapter = config.module;
                        //    system.speaker.registerSpeakerAdapter(new SpeakerAdapter(system, config.options), cb);
                        //},

                        // Listen the orm events bus
                        // The orm bus act as a link to update runtime plugins/modules/etc whenever
                        // something in database is updated and should be reflected in runtime.
                        function(cb){

                            // Listen for plugins update
                            // In this case we need to update the possible runtime plugins
                            // system.on('orm:plugins:updated', function(plugin){
                            //
                            //     // check if a plugin with taht name (and belong to the user) is registered
                            //     if(system.plugins.has(plugin.name) && system.runtime.profileManager.getActiveProfileId() === plugin.userId){
                            //         // Then we need to update its user options
                            //         system.plugins.get(plugin.name).setOptions(plugin.get('userOptions'));
                            //     }
                            // });

                            // Listen for user update
                            // We need to update the active profile to keep for example the user config
                            // up to date.
                            // system.on('orm:user:updated', function(user){
                            //
                            //     if(system.runtime.profileManager.getActiveProfile().id === user.get('id')){
                            //         system.runtime.profileManager.setActiveProfile(user.toJSON());
                            //     }
                            // });

                            return cb();
                        },

                        // Listen the communication bus
                        function(cb) {

                            // Listen for new task being created
                            // system.bus.on('task:created', function(task) {
                            //     // Run task if a profile is loaded + check if task user = profile
                            //     // No need to be sync, task is ran in background
                            //     if(system.runtime.profileManager.hasActiveProfile()){
                            //         system.runtime.registerTask(task, function(err){
                            //             if(err){
                            //                 if(err.moduleNotLoaded) {
                            //                     system.logger.warn(err.message);
                            //                 }
                            //                 else {
                            //                     system.logger.error("An error occurred when registering the task %s", task.id, err);
                            //                 }
                            //                 return;
                            //             }
                            //             system.notificationService.push('success', util.format('Task %s registered for the running profile', task.id));
                            //         });
                            //     }
                            // });

                            return cb();
                        },

                        function(cb) {
                            system.communicationBus.initialize(cb);
                        },

                    ], done);
                },
            ], function(err){

                if (err) {
                    return reject(err);
                }
                self.logger.debug("Old bootstrap initialized");
                return resolve();
            });
        });
    }
}

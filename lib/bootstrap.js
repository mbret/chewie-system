'use strict';

var async = require('async');
// var _ = require('lodash');
// var utils = require('my-buddy-lib').utils;
var util = require('util');
var path = require('path');
var DefaultTextToSpeechAdapter = require(CORE_DIR + '/speaker').DefaultTextToSpeechAdapter;
// var Task = require(CORE_DIR + '/plugins/tasks/task.js');
// var requireAll  = require('my-buddy-lib').requireAll;

/**
 * 
 * @param system
 * @param logger
 * @param bootstrapDone
 */
module.exports = function(system, logger, bootstrapDone){

    async.series([

        // Use daemon as a bridge to pass some events
        // It may more easy to catch elsewhere
        function(done) {
            system.apiServer.on("initialized", function() { setImmediate(function() { system.emit('api-server:initialized'); }) });
            return done();
        },

        // We need the user to be loaded to initialize
        // because it load the user related config.
        function(done){
            return system.configHandler.initialize(done);
        },

        // Initialize api & web server.
        function(done){
            async.parallel([
                // Start api server
                function(cb){
                    system.apiServer.initialize(cb);
                },
                // Start web server
                function(cb){
                    system.webServer.initialize(cb);
                }
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
                function(cb){
                    var config = system.getConfig().system.speakerAdapter;
                    if(config === null) {
                        logger.warn('No speaker adapter set. You will not have any audio output.');
                        return cb();
                    }
                    var SpeakerAdapter = config.module;
                    system.speaker.registerSpeakerAdapter(new SpeakerAdapter(system, config.options), cb);
                },

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
                }

            ], done);
        },

        initializeHooks

    ], function(err){
        return bootstrapDone(err);
    });

    function initializeHooks(cb) {
        logger.verbose("Initializing core hooks...");

        var hooks = [];
        require("fs").readdir(system.getConfig().coreHooksDir, function(err, files) {
            logger.verbose("List of core hooks found", util.inspect(files));
            files.forEach(function(file) {
                var hookModule = require(path.resolve(system.getConfig().coreHooksDir, file));
                var module = new hookModule();
                hooks.push({
                    name: file,
                    module: module
                });
            });

            async.each(hooks, function(hook, cb2) {
                hook.module.initialize(function(err) {
                    logger.verbose("Core hook %s initialized", hook.name);
                    return cb2(err);
                });
            }, cb);
        });
    }
};

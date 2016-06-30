'use strict';

var async = require('async');
var _ = require('lodash');
var utils = require('my-buddy-lib').utils;
var util = require('util');
var Sequelize = require('sequelize');
var path = require('path');
var WinstonTransportSequelize = require('my-buddy-lib').WinstonTransportSequelize;
var DefaultTextToSpeechAdapter = require(CORE_DIR + '/speaker').DefaultTextToSpeechAdapter;
var Task = require(CORE_DIR + '/plugins/tasks/task.js');
var requireAll  = require('my-buddy-lib').requireAll;

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

        /*
         * Orm initialization
         * - create orm
         * - create and attach models
         * - create tables
         * - init admin user
         */
        function(done){
            system.orm = {};
            system.orm.sequelize = new Sequelize('database', 'admin', null, system.getConfig().database.connexion);

            // Define models
            system.orm.models = {};
            system.orm.models.Logs = require(CORE_DIR + '/models/logs')(system.orm.sequelize, system);
            system.orm.models.User = require(CORE_DIR + '/models/user')(system.orm.sequelize, system);
            system.orm.models.Plugins = require(CORE_DIR + '/models/plugins')(system.orm.sequelize, system);
            system.orm.models.Task = require(CORE_DIR + '/models/task')(system.orm.sequelize, system);
            system.orm.models.User.hasMany(system.orm.models.Plugins);
            system.orm.models.User.hasMany(system.orm.models.Task);
            system.orm.models.Plugins.belongsTo(system.orm.models.User);
            system.orm.models.Task.belongsTo(system.orm.models.User);

            system.orm.models.Plugins.hook('afterUpdate', function(plugin, options){
                system.emit('orm:plugins:updated', plugin);
            });

            system.orm.models.User.hook('afterUpdate', function(user, options){
                system.emit('orm:user:updated', user);
            });

            // create tables
            Promise
                .all([
                    system.orm.models.Logs.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                    system.orm.models.User.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                    system.orm.models.Plugins.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                    system.orm.models.Task.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                ])
                .then(function () {

                    // Add the db as a storage for logs
                    // Every logs since this point will be stored in db
                    MyBuddy.logger.Logger.addTransportForAllLoggers(new WinstonTransportSequelize({
                        sequelize: system.orm.sequelize,
                        model: system.orm.models.Logs,
                        level: system.getConfig().log.level
                    }));

                    // By default there is always one user. The administrator
                    return system.orm.models.User.initAdmin();
                })
                .then(function(){
                    return done();
                })
                .catch(done);
        },

        /*
         * Initialize database
         * - also load users or create it for the first launch
         */
        function(done){
            system.database.initialize(function(err){
                if(err){
                    return done(err);
                }

                system.notificationService.setStorageAdapter(system.database.getAdapter('notifications'));
                system.configHandler.setStorageAdapter(system.database.getAdapter('system'));
                return done();
            });
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
                            var newTask = Task.Build(system, task);
                            system.runtimeHelper.registerTask(newTask, function(err){
                                if(err){
                                    console.error(err);
                                    return;
                                }
                                system.notificationService.push('success', util.format('Task %s registered for the running profile', newTask.id));
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

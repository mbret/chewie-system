'use strict';

var async = require('async');
var _ = require('lodash');
var utils = require('my-buddy-lib').utils;
var Sequelize = require('sequelize');
var path = require('path');
var WinstonTransportSequelize = require('my-buddy-lib').WinstonTransportSequelize;
var SpeakerAdapter = require(CORE_DIR + '/speaker').DefaultAdapter;

/**
 *
 * @param system
 * @param cb
 */
module.exports = function(system, logger, cb){

    async.series([

        /**
         * Orm initialization
         * - create orm
         * - create and attach models
         * - create tables
         * - init admin user
         */
        function(done){
            system.orm = {};
            system.orm.sequelize = new Sequelize('database', 'admin', null, system.getConfig().database.connexion);

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

                    MyBuddy.logger.Logger.addTransportForAllLoggers(new WinstonTransportSequelize({
                        sequelize: system.orm.sequelize,
                        model: system.orm.models.Logs,
                        level: system.getConfig().log.level
                    }));

                    system.orm.models.User.initAdmin()
                        .then(function(){
                            done();
                        })
                        .catch(done);
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

        /*
         * Initialize api & web server.
         */
        function(done){
            async.parallel([
                // Start api server
                function(cb){
                    system.apiServer.initialize(function(err){
                        if(err){
                            return cb(err);
                        }
                        system.emit('api-server:initialized');
                        return cb();
                    });
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
                function(cb){
                    var adapter = new SpeakerAdapter(system);
                    adapter.initialize(function(err){
                        if(err){
                            return cb(err);
                        }
                        system.speaker.setAdapter(adapter);

                        return cb();
                    });
                },

                // Listen the orm events bus
                // The orm bus act as a link to update runtime plugins/modules/etc whenever
                // something in database is updated and should be reflected in runtime.
                function(cb){

                    // Listen for plugins update
                    // In this case we need to update the possible runtime plugins
                    system.on('orm:plugins:updated', function(plugin){

                        // check if a plugin with taht name (and belong to the user) is registered
                        if(system.plugins.has(plugin.name) && system.profileManager.getActiveProfileId() === plugin.userId){
                            // Then we need to update its user options
                            system.plugins.get(plugin.name).setOptions(plugin.get('userOptions'));
                        }
                    });

                    // Listen for user update
                    // We need to update the active profile to keep for example the user config
                    // up to date.
                    system.on('orm:user:updated', function(user){

                        if(system.profileManager.getActiveProfile().id === user.get('id')){
                            system.profileManager.setActiveProfile(user.toJSON());
                        }
                    });

                    return cb();
                }

            ], done);
        }

    ], function(err){
        return cb(err);
    });

};
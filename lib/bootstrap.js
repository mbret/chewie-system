'use strict';

var async = require('async');
var _ = require('lodash');
var utils = require('my-buddy-lib').utils;
var Sequelize = require('sequelize');

/**
 *
 * @param system
 * @param cb
 */
module.exports = function(system, logger, cb){

    async.series([

        /**
         * Init and create all the required folders for system.
         */
        function(done){
            utils.initDirs([
                system.configHandler.getSystemConfig().system.tmpDir,
                system.configHandler.getSystemConfig().system.dataDir,
                system.configHandler.getSystemConfig().system.persistenceDir
            ], done);
        },

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
            system.orm.models.User = require(CORE_DIR + '/models/user')(system.orm.sequelize, system);
            system.orm.models.Plugins = require(CORE_DIR + '/models/plugins')(system.orm.sequelize, system);
            system.orm.models.Tasks = require(CORE_DIR + '/models/tasks')(system.orm.sequelize, system);
            system.orm.models.User.hasMany(system.orm.models.Plugins);
            system.orm.models.User.hasMany(system.orm.models.Tasks);
            system.orm.models.Plugins.belongsTo(system.orm.models.User)
            system.orm.models.Tasks.belongsTo(system.orm.models.User)

            // create tables
            Promise
                .all([
                    system.orm.models.User.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                    system.orm.models.Plugins.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                    system.orm.models.Tasks.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                ])
                .then(function () {
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
                system.moduleHandler.setStorageAdapter(system.database.getAdapter('tasks'));
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

    ], function(err){
        return cb(err);
    });

};
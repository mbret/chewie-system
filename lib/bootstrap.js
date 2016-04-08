'use strict';

var async = require('async');
var _ = require('lodash');
var utils = require('my-buddy-lib').utils;
var Sequelize = require('sequelize');
var path = require('path');
var WinstonTransportSequelize = require('my-buddy-lib').WinstonTransportSequelize;

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

            // create tables
            Promise
                .all([
                    system.orm.models.Logs.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                    system.orm.models.User.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                    system.orm.models.Plugins.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                    system.orm.models.Task.sync({force: system.getConfig().database.connexion.dropOnStartup}),
                ])
                .then(function () {

                    LOGGER.addTransportForAllLoggers(new WinstonTransportSequelize({
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

    ], function(err){
        return cb(err);
    });

};
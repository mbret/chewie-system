'use strict';

var async = require('async');
var _ = require('lodash');
var utils = require(MODULES_DIR + '/utils');

/**
 *
 * @param system
 * @param cb
 */
module.exports = function(system, cb){

    var logger = system.logger;

    async.series([

        function(done){
            utils.initDirs([
                system.configHandler.getSystemConfig().tmpDir,
                system.configHandler.getSystemConfig().dataDir,
                system.configHandler.getSystemConfig().persistenceDir
            ], done);
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
                    logger.debug('Initialize Web Server...');
                    system.webServer.initialize(cb);
                }
            ], done);
        },

        // load plugins
        function(done){
            logger.debug('Load plugins...');
            system.pluginsHandler.loadPlugins(function(err, plugins){
                system.plugins = plugins;
                return done(err);
            });
        },

        // Start core module
        function(done){
            logger.debug('Start core modules...');
            system.coreModulesHandler.startCoreModules(system.coreModules, function(err){
                if(err) return done(err);
                system.emit('coreModules:initialized');
                return done();
            });
        },

        // start task trigger
        function(done){
            logger.debug('Start task triggers ...');
            system.triggersHandler.startModules(system.triggers, done)
        },

        // Start modules
        function(done){
            system.moduleHandler.initializeModules(system.userModules, done);
        },

        // Start message adapters
        function(done){
            system.messageAdaptersHandler.initializeAdapters(done);
        }

    ], function(err){
        return cb(err);
    });

};
'use strict';

var async = require('async');
var _ = require('lodash');

/**
 * "this" context is relative to daemon.
 * @param cb
 */
module.exports = function(cb){

    var self = this;
    var logger = this.logger;

    async.series([

        /*
         * Initialize database
         * - also load users or create it for the first launch
         */
        function(done){
            self.database.initialize(function(err){
                if(err){
                    return done(err);
                }

                self.notificationService.setStorageAdapter(self.database.getAdapter('notifications'));
                self.configHandler.setStorageAdapter(self.database.getAdapter('system'));
                return done();
            });
        },

        /*
         * Initialize user.
         * Create object and init + load from db.
         */
        self.user.initialize.bind(self.user),

        // We need the user to be loaded to initialize
        // because it load the user related config.
        function(done){
            return self.configHandler.initialize(done);
        },

        /*
         * Initialize api & web server.
         */
        function(done){
            async.parallel([
                // Start api server
                function(cb){
                    self.apiServer.initialize(function(err){
                        if(err){
                            return cb(err);
                        }
                        self.emit('api-server:initialized');
                        return cb();
                    });
                },
                // Start web server
                function(cb){
                    logger.debug('Initialize Web Server...');
                    self.webServer.initialize(cb);
                }
            ], done);
        },

        // load plugins
        function(done){
            logger.debug('Load plugins...');
            self.pluginsHandler.loadPlugins(function(err, plugins){
                self.plugins = plugins;
                return done(err);
            });
        },

        // Start core module
        function(done){
            logger.debug('Start core modules...');
            self.coreModulesHandler.startCoreModules(self.coreModules, function(err){
                if(err) return done(err);
                self.emit('coreModules:initialized');
                return done();
            });
        },

        // start task trigger
        function(done){
            logger.debug('Start task triggers ...');
            self.triggersHandler.startModules(self.triggers, done)
        },

        // Start modules
        function(done){
            self.moduleHandler.initializeModules(self.userModules, done);
        },

        // Start message adapters
        function(done){
            self.messageAdaptersHandler.initializeAdapters(done);
        }

    ], function(err){
        return cb(err);
    });

};
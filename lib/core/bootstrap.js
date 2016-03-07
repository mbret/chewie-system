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
        self.database.initialize.bind(self.database),

        /*
         * Finally load the complete config.
         * - Config from storage will be merged with current config.
         */
        function(done){
            self.database.getAdapter('system').loadConfigOrCreate(function(err, data){
                if(err) return done(err);

                // Now merge db config with current config to get full config
                self.config = _.merge(self.config, data);
                return done();
            });
        },

        /*
         * Initialize user.
         * Create object and init + load from db.
         */
        self.user.initialize.bind(self.user),

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
            self.tasksTriggersHandler.startModules(self.taskTriggers, done)
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
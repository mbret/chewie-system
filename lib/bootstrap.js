'use strict';

var async = require('async');
var _ = require('lodash');
var utils = require('my-buddy-lib').utils;
var Waterline = require('waterline');

var waterline = new Waterline();

/**
 *
 * @param system
 * @param cb
 */
module.exports = function(system, logger, cb){

    async.series([

        function(done){
            utils.initDirs([
                system.configHandler.getSystemConfig().system.tmpDir,
                system.configHandler.getSystemConfig().system.dataDir,
                system.configHandler.getSystemConfig().system.persistenceDir
            ], done);
        },

        /**
         * Waterline initialization
         */
        function(done){
            var userCollection = Waterline.Collection.extend(require(CORE_DIR + '/models/user'));
            waterline.loadCollection(userCollection);
            waterline.initialize(system.configHandler.getConfig().waterline, function(err, ontology){
                if(err){
                    return done(err);
                }

                system.orm.collections = ontology.collections;

                // system.orm.collections.user.create({ // First we create a user.
                //     firstName: 'Neil',
                //     lastName: 'Armstrong'
                // }).catch(function(err){
                //     console.log(err);
                // });
                return done();
            });
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
'use strict';

// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually start from.
process.chdir(__dirname);

global.LIB_DIR      = __dirname + "/lib";
global.CONFIG_DIR   = __dirname + '/lib/config';
global.MODULES_DIR  = __dirname + "/lib/modules";
global.CORE_DIR     = __dirname + "/lib/core";
var cluster         = require('cluster');
var async           = require('async');
var childProcess    = require('child_process');
var _               = require('lodash');

// Get static config handler
var ConfigHandler = require('./lib/core/config-handler.js');
var config = ConfigHandler.loadConfig(__dirname);

// Logger require config to be loaded
var Logger = require('my-buddy-lib').logger.Logger;
global.LOGGER = new Logger(config);
var logger = LOGGER.getLogger('buddy');

if (cluster.isMaster) {

    exports.registerNewPluginDirectory = function(){
        // dummy
    };

    exports.registerNewConfig = function(){
        // dummy
    };

    /**
     *
     */
    exports.start = function(){

        // Master cluster
        // The first one running
        cluster.fork();

        cluster.on('exit', function(worker, code, signal) {
            if(code === 42){
                logger.info('Daemon restart');
                cluster.fork();
            }
            else{
                logger.info('Daemon shutted down');
            }
        });
    };
}

// Once cluster is created, run system
if (cluster.isWorker) {

    var Daemon = require('./lib/index.js');

    /**
     *
     * @param path
     */
    exports.registerNewPluginDirectory = function(path){
        config.externalModuleRepositories.push(path);
    };

    /**
     *
     * @param entry
     */
    exports.registerNewConfig = function(entry){
        config = _.merge(config, entry);
    };

    /**
     *
     */
    exports.start = function(){

        logger.info('Start daemon');

        checkRequiredModules(function(err, missingModules){
            if(err) throw err;
            if(missingModules.length > 0){
                logger.error('It seems that some required global modules are not installed. Please verify these modules: ' + missingModules.join(', ') );
                process.exit(0);
            }

            new Daemon(config);
        });

    };
}

/**
 * Check for required global modules.
 * @param cb
 */
function checkRequiredModules(cb){
    var missingModules = [];

    async.parallel([
        function(done){
            childProcess.exec('gulp -v', function(err){
                if(err){
                    missingModules.push('gulp');
                }
                return done();
            });
        },
    ], function(err){
        return cb(null, missingModules);
    });
}
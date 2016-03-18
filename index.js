'use strict';

global.ROOT_DIR     = __dirname;
global.LIB_DIR      = __dirname + "/lib";
global.CONFIG_DIR   = __dirname + '/config';
global.MODULES_DIR  = __dirname + "/lib/modules";
global.CORE_DIR     = __dirname + "/lib/core";
var cluster         = require('cluster');
var async           = require('async');
var childProcess    = require('child_process');
var _               = require('lodash');
var ConfigHandler   = require(CORE_DIR + '/config-handler');
var Logger          = require('my-buddy-lib').logger.Logger;

// Read configs + user config
var config = _.merge(
    ConfigHandler.loadConfig(CONFIG_DIR),
    ConfigHandler.loadConfig(process.cwd())
);

// Initialize logger
global.LOGGER = new Logger(config);
var logger    = LOGGER.getLogger('buddy');

console.log(LOGGER);
process.exit();

if (cluster.isMaster) {

    exports.registerNewPluginDirectory = function(){};

    exports.registerNewConfig = function(){};

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

    // Register a new plugin directory before startup
    exports.registerNewPluginDirectory = function(path){
        config.externalModuleRepositories = config.externalModuleRepositories || [];
        config.externalModuleRepositories.push(path);
    };

    // Add an extra config manually before startup
    exports.registerNewConfig = function(entry){
        config = _.merge(config, entry);
    };

    // Start the daemon
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
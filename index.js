'use strict';

// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually start from.
process.chdir(__dirname);

global.LIB_DIR = __dirname + "/lib";
var cluster = require('cluster');
var _ = require('lodash');
var configHandler = require('./lib/config-handler.js');
var config = configHandler.loadConfig(__dirname, __dirname);

// Logger require config to be loaded
var Logger = require('./lib/logger.js');
global.LOGGER = new Logger(config);
var logger = LOGGER.getLogger('buddy');
var Daemon = require('./lib/daemon.js');

exports.registerNewPluginDirectory = function(path){
    config.externalModuleRepositories.push(path);
};

exports.registerNewConfig = function(newConfig){
    config = _.merge(config, newConfig);
};

exports.start = function(){

    // Master cluster
    // The first one running
    if (cluster.isMaster) {
        logger.info('Start daemon');
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
    }
    else {
        // do nothing
    }

};

// Once cluster is created, run system
if (cluster.isWorker) {
    var daemon = new Daemon(config);
}
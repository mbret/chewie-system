'use strict';

// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually start from.
process.chdir(__dirname);

global.LIB_DIR = __dirname + "/lib";
var cluster = require('cluster');
var _ = require('lodash');

// Get static config handler
var ConfigHandler = require('./lib/config-handler.js');
var config = ConfigHandler.loadConfig(__dirname);

// Logger require config to be loaded
var Logger = require('./lib/logger.js');
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

    var Daemon = require('./lib/daemon.js');

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
        var daemon = new Daemon(config);
    };
}
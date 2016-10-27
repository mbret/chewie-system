'use strict';

var http = require('http');
var express = require('express');
var kraken = require('kraken-js');
var express     = require('express');
var router      = require('express').Router();
var app         = express();
var https       = require('https');
var async       = require('async');
var bodyParser  = require("body-parser");
var path        = require('path');
var fs          = require('fs');
//var expressLayouts = require('express-ejs-layouts');
const child_process = require('child_process');
//var privateKey      = fs.readFileSync(__dirname + '/../configuration/ssl/server.key', 'utf8');
//var certificate     = fs.readFileSync(__dirname + '/../configuration/ssl/server.crt', 'utf8');
var EventEmitter = require("events");
var options, app, server;
app = express();

module.exports = function(system) {

    var logger =  system.logger.Logger.getLogger('Web server');
    app.locals.system = system;

    /*
     * Create and configure application. Also exports application instance for use by tests.
     * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
     */
    options = {
        onconfig: function (config, next) {
            /*
             * Add any additional config setup or overrides here. `config` is an initialized
             * `confit` (https://github.com/krakenjs/confit/) configuration object.
             */
            next(null, config);
        }
    };

    // Prepare app
    app.use(kraken(options));
    server = http.createServer(app);
    server.listen(process.env.PORT || 8000);
    server.on('listening', function () {
        logger.debug('Server listening on http://localhost:%d', this.address().port);
    });

    // Run the build task
    let gruntTask = system.config.env === "development" ? "watch" : "build";
    child_process.exec('grunt ' + gruntTask, {cwd: __dirname }, function (error, stdout, stderr) {
        if(error) {
            logger.error('Error while running gulp task, here is the stdout:', stdout);
            throw error;
        }
        logger.debug(`stdout: ${stdout}`);
        logger.debug(`stderr: ${stderr}`);
    });

    return new Promise(function(resolve) {
        app.on('start', function () {
            logger.debug('Application ready to serve requests.');
            logger.debug('Environment: %s', app.kraken.get('env:env'));
            return resolve();
        });
    });
};

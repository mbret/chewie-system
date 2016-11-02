'use strict';
var http = require('http');
var kraken = require('kraken-js');
var express = require('express');
var app = express();
var https = require('https');
var async = require('async');
var bodyParser = require("body-parser");
var path = require('path');
var fs = require('fs');
var privateKey = null;
var certificate = null;
var server;
var self = null;
var ClientWebServer = (function () {
    function ClientWebServer(system) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('ClientWebServer');
    }
    ClientWebServer.prototype.initialize = function (done) {
        app.locals.system = this.system;
        /*
         * Create and configure application. Also exports application instance for use by tests.
         * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
         */
        var options = {
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
        // use ssl ?
        if (self.system.config.webServerSSL.activate) {
            privateKey = fs.readFileSync(self.system.config.webServerSSL.key, 'utf8');
            certificate = fs.readFileSync(self.system.config.webServerSSL.cert, 'utf8');
            server = https.createServer({ key: privateKey, cert: certificate }, app);
        }
        else {
            server = http.createServer(app);
        }
        server.listen(self.system.config.webServerPort);
        server.on('listening', function () {
            self.logger.debug('Server listening on http://localhost:%d', this.address().port);
        });
        app.on('start', function () {
            self.logger.debug('Application ready to serve requests.');
            self.logger.debug('Environment: %s', app.kraken.get('env:env'));
            return done();
        });
    };
    return ClientWebServer;
}());
exports.ClientWebServer = ClientWebServer;

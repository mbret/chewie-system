'use strict';
import {System} from "../../system";
import * as _ from "lodash";
import {HookInterface, Hook} from "../../core/hook-interface";
import {customResponses} from "./lib/custom-responses";
let http = require('http');
let kraken = require('kraken-js');
let express = require('express');
let app = express();
let https = require('https');
let async = require('async');
let path = require('path');
let fs = require('fs');
var httpProxy = require('http-proxy');
let privateKey = null;
let certificate = null;
let server;

export = class ClientWebServer extends Hook implements HookInterface, InitializeAbleInterface {

    constructor(system: System) {
        super(system);
        this.logger = system.logger.Logger.getLogger('ClientWebServer');
    }

    initialize() {
        let self = this;
        let useSSL = self.system.config.webServerSSL.activate;
        app.locals.system = this.system;

        /*
         * Create and configure application. Also exports application instance for use by tests.
         * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
         */
        let options = {
            onconfig: function (config, next) {
                /*
                 * Add any additional config setup or overrides here. `config` is an initialized
                 * `confit` (https://github.com/krakenjs/confit/) configuration object.
                 */
                next(null, config);
            }
        };

        app.locals.proxy = httpProxy.createProxyServer({
            secure: false
        });

        // Proxy web for shared remote api
        app.all("/remote-api/*", function(req, res) {
            self.logger.verbose("Proxying %s to %s", req.url, req.app.locals.system.config.sharedApiUrl + "/" + req.url);
            req.url = req.url.replace("/remote-api", "");
            req.app.locals.proxy.web(req, res, { target: req.app.locals.system.config.sharedApiUrl, forward: req.url });
        });

        // Prepare app
        app.use(kraken(options));
        app.use(customResponses);

        // Create server
        if (useSSL) {
            server = https.createServer({
                key: fs.readFileSync(self.system.config.webServerSSL.key, 'utf8'),
                cert: fs.readFileSync(self.system.config.webServerSSL.cert, 'utf8')
            }, app);
        } else {
            server = http.createServer(app);
        }

        // Proxy socket for shared remote api
        server.on('upgrade', function (req, socket, head) {
            app.locals.proxy.ws(req, socket, head);
        });

        app.locals.proxy.on('error', function(e) {
            self.logger.error("Error on remote api proxy", e);
        });

        server.listen(self.system.config.webServerPort);
        server.on('listening', function () {
            app.locals.url = self.system.config.webServerUrl;
            app.locals.realUrl = self.system.config.webServerRemoteUrl;
            self.logger.debug('Server listening on %s (%s from outside)', app.locals.url, app.locals.realUrl);
        });
        server.on("error", function(err) {
            if (err.code === "EADDRINUSE") {
                self.logger.error("It seems that something is already running on port %s. The web client will not be able to start. Maybe a chewie app is already started ?", self.system.config.webServerPort);
            } else {
                self.logger.error("Error while starting client web server", err);
            }
        });

        app.once('start', function () {
            self.logger.debug('Application ready to serve requests.');
            self.logger.debug('Environment: %s', app.kraken.get('env:env'));
        });

        return Promise.resolve();
    }
}

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
let httpProxy = require('http-proxy');
let socket = require('socket.io');
let server, proxyServer;
let localConfig = require("./hook-config");

export default class ClientWebServer extends Hook implements HookInterface, InitializeAbleInterface {

    constructor(system: System, config: any) {
        super(system, config);
        this.config = _.merge(localConfig, config);
        this.logger = system.logger.getLogger('ClientWebServer');
    }

    initialize() {
        let self = this;
        let useSSL = self.system.config.webServerSSL.activate;
        let sslConf = {
            key: fs.readFileSync(self.system.config.webServerSSL.key, 'utf8'),
            cert: fs.readFileSync(self.system.config.webServerSSL.cert, 'utf8')
        };
        let proxyServerPort = this.config.proxyServerPort;
        app.locals.system = this.system;
        app.locals.server = this;

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

        // Prepare app
        app.use(kraken(options));
        app.use(customResponses);

        // Web client server
        server = https.createServer(sslConf, app);

        // Proxy server for remote api
        proxyServer = httpProxy.createProxyServer({
            ssl: sslConf,
            target: app.locals.system.config.sharedApiUrl,
            secure: false,
            ws: true
        });

        // wait for proxy server before listening web client server
        proxyServer.listen(proxyServerPort)
            .on("error", function(err) {
                if (err.code === "EADDRINUSE") {
                    self.logger.error("It seems that something is already running on port %s. The proxy will not be able to start. Maybe a chewie app is already started ?", proxyServerPort);
                } else {
                    self.logger.error("Error while starting proxy server", err);
                }
            })
            // little hack, proxy-http does not expose server via api (officially)
            ._server.on("listening", function() {
                self.logger.debug('Proxy server listening');
                // then start client web server
                server.listen(self.system.config.webServerPort);
            });

        server
            .on('listening', function () {
                app.locals.url = self.system.config.webServerUrl;
                app.locals.realUrl = self.system.config.webServerRemoteUrl;
                self.logger.debug('Server listening on %s (%s from outside)', app.locals.url, app.locals.realUrl);
            })
            .on("error", function(err) {
                if (err.code === "EADDRINUSE") {
                    self.logger.error("It seems that something is already running on port %s. The web client will not be able to start. Maybe a chewie app is already started ?", self.system.config.webServerPort);
                } else {
                    self.logger.error("Error on client web server", err);
                }
            });

        app.locals.io = socket(server, {});
        app.locals.io
            .on('connection', function (socket) {
                self.logger.debug("Socket connected");
                socket.on('disconnect', function(){
                    self.logger.debug("Socket disconnected");
                });
            })
            .on("error", function(err) {
                self.logger.error("Error on server socket", err);
            });

        // listen for running scenarios update
        this.system.on("running-scenarios:updated", function() {
            app.locals.io.emit("running-scenarios:updated");
        });

        app.once('start', function () {
            self.logger.debug('Application ready to serve requests.');
            self.logger.debug('Environment: %s', app.kraken.get('env:env'));
        });

        return Promise.resolve();
    }
}

'use strict';
import {System} from "../../system";
import {HookInterface} from "../../core/hook-interface";
import {customResponses} from "./lib/custom-responses";
import {Hook} from "../../core/hook";
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
const url = require('url');

export default class ClientWebServer extends Hook implements HookInterface {

    public app: any;

    constructor(system: System, config: any) {
        super(system, config);
        this.config = config;
        this.logger = system.logger.getLogger("chewie:hook:client-web-server");
        this.app = app;
    }

    initialize() {
        let self = this;
        let sslConf = {
            key: fs.readFileSync(self.config.ssl.key, 'utf8'),
            cert: fs.readFileSync(self.config.ssl.cert, 'utf8')
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

        // http logger for api only
        app.use("/api", function (req, res, next) {
            self.logger.verbose(`[${req.hostname } (${req.protocol})] "${req.method} ${req.url} ${req.headers['user-agent'] || '(no user-agent)'}"`);
            return next();
        });

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
                self.logger.error("Error while starting proxy server", err);
            })
            ._server
                .on("error", function(err) {
                    if (err.code === "EADDRINUSE") {
                        self.logger.error("It seems that something is already running on port %s. The proxy will not be able to start. Maybe a chewie app is already started ?", proxyServerPort);
                    } else {
                        self.logger.error("Error while starting proxy server", err);
                    }
                })
                .on("request", function(req) {
                    self.logger.verbose(`Proxy -> [${req.headers.host} (${req.connection.encrypted ? "https" : "http"})] "${req.method} ${req.url} ${req.headers['user-agent'] || '(no user-agent)'}"`);
                })
                // little hack, proxy-http does not expose server via api (officially)
                .on("listening", function() {
                    self.logger.debug(`Proxy server listening on port ${proxyServerPort}`);
                    // then start client web server
                    server.listen(self.config.port);
                });

        // Web server handling
        server
            .on('listening', function () {
                app.locals.url = `https://localhost:${self.config.port}`;
                app.locals.realUrl = `https://${self.system.config.systemIP}:${self.config.port}`;
                self.logger.debug('Server listening on %s (%s from outside)', app.locals.url, app.locals.realUrl);
            })
            .on("error", function(err) {
                if (err.code === "EADDRINUSE") {
                    self.logger.error("It seems that something is already running on port %s. The web client will not be able to start. Maybe a chewie app is already started ?", self.config.port);
                } else {
                    self.logger.error("Error on client web server", err);
                }
            });

        // Socket server handling
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

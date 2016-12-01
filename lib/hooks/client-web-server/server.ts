'use strict';
import {Daemon} from "../../daemon";
import {Hook} from "../../core/hook";
let http = require('http');
let kraken = require('kraken-js');
let express = require('express');
let app = express();
let https = require('https');
let async = require('async');
let bodyParser = require("body-parser");
let path = require('path');
let fs = require('fs');
let privateKey = null;
let certificate = null;
let server;
let self = null;

export class ClientWebServer implements Hook {

    system: Daemon;
    logger: any;

    constructor(system: Daemon) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('ClientWebServer');
    }

    initialize(done: Function) {

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

        // Prepare app
        app.use(kraken(options));

        // @todo it should be moved elsewhere
        app.use(function(req, res, next){

            res.badRequest = function(data){
                console.log(data);
                if(_.isString(data)) {
                    data = {message: data};
                }
                data.data = data.data || {};
                if (data.errors) {
                    data.data.errors = data.errors;
                }
                var errResponse = {
                    status: data.status || "error",
                    code: data.code || "badRequest",
                    message: data.message || "",
                    data: data.data || {}
                };

                return res.status(400).send(errResponse);
            };

            res.created = function(data){
                return res.status(201).send(data);
            };

            res.ok = function(data){
                return res.status(200).send(data);
            };

            res.notFound = function(data){
                var errResponse = {};
                errResponse.status = "error";
                errResponse.code = "notFound";
                errResponse.message = data;
                errResponse.data = {};
                return res.status(404).send(errResponse);
            };

            res.updated = function(data){
                return res.status(200).send(data);
            };

            res.serverError = function(err){
                var errResponse = {};
                errResponse.status = "error";
                errResponse.code = "serverError";
                errResponse.message = "An internal error occured";
                errResponse.data = {};

                // Handle Error object
                if(err instanceof Error) {
                    errResponse = _.merge(errResponse, {message: err.message, data: {stack: err.stack, code: err.code}});
                }

                if(_.isString(err)) {
                    errResponse.message = err;
                }

                return res.status(500).send(errResponse)
            };

            return next();
        });

        // use ssl ?
        if (useSSL) {
            privateKey = fs.readFileSync(self.system.config.webServerSSL.key, 'utf8');
            certificate = fs.readFileSync(self.system.config.webServerSSL.cert, 'utf8');
            server = https.createServer({key: privateKey, cert: certificate}, app);
        } else {
            http.createServer(app).listen();
        }

        server.listen(self.system.config.webServerPort);
        server.on('listening', function () {
            app.locals.url = self.system.config.webServerUrl;
            app.locals.realUrl = self.system.config.webServerRemoteUrl;
            self.logger.debug('Server listening on %s (%s from outside)', app.locals.url, app.locals.realUrl);
        });

        app.on('start', function () {
            self.logger.debug('Application ready to serve requests.');
            self.logger.debug('Environment: %s', app.kraken.get('env:env'));
            return done();
        });
    }
}

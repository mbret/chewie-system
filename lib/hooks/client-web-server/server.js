'use strict';
var _ = require("lodash");
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
module.exports = (function () {
    function ClientWebServer(system) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('ClientWebServer');
    }
    ClientWebServer.prototype.initialize = function (done) {
        var useSSL = self.system.config.webServerSSL.activate;
        app.locals.system = this.system;
        var options = {
            onconfig: function (config, next) {
                next(null, config);
            }
        };
        app.use(kraken(options));
        app.use(function (req, res, next) {
            res.badRequest = function (data) {
                if (_.isString(data)) {
                    data = { message: data };
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
            res.created = function (data) {
                return res.status(201).send(data);
            };
            res.ok = function (data) {
                return res.status(200).send(data);
            };
            res.notFound = function (data) {
                var errResponse = {};
                errResponse.status = "error";
                errResponse.code = "notFound";
                errResponse.message = data;
                errResponse.data = {};
                return res.status(404).send(errResponse);
            };
            res.updated = function (data) {
                return res.status(200).send(data);
            };
            res.serverError = function (err) {
                var errResponse = {};
                errResponse.status = "error";
                errResponse.code = "serverError";
                errResponse.message = "An internal error occured";
                errResponse.data = {};
                if (err instanceof Error) {
                    errResponse = _.merge(errResponse, { message: err.message, data: { stack: err.stack, code: err.code } });
                }
                if (_.isString(err)) {
                    errResponse.message = err;
                }
                return res.status(500).send(errResponse);
            };
            return next();
        });
        if (useSSL) {
            privateKey = fs.readFileSync(self.system.config.webServerSSL.key, 'utf8');
            certificate = fs.readFileSync(self.system.config.webServerSSL.cert, 'utf8');
            server = https.createServer({ key: privateKey, cert: certificate }, app);
        }
        else {
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
    };
    return ClientWebServer;
}());

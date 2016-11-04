'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app = require('express')();
var io = require('socket.io');
var https = require('https');
var http = require("http");
var fs = require('fs');
var _ = require("lodash");
var path = require('path');
var requireAll = require('my-buddy-lib').requireAll;
var EventEmitter = require("events");
var Services = require("./services");
var Server = (function (_super) {
    __extends(Server, _super);
    function Server(system) {
        _super.call(this);
        this.logger = system.logger.Logger.getLogger('Api server');
        var self = this;
        this.system = system;
        this.initialized = false;
        this.server = null;
        this.services = {};
        this.io = null;
        // Include all services
        _.forEach(Services, function (module, key) {
            self.services[key.charAt(0).toLowerCase() + key.slice(1)] = new module(system);
        });
    }
    Server.prototype.initialize = function (cb) {
        var self = this;
        require(__dirname + '/bootstrap')(this, app, function (err) {
            if (err) {
                return cb(err);
            }
            self._startServer(function (err) {
                if (err) {
                    return cb(err);
                }
                self.logger.verbose('Initialized');
                self.emit("initialized");
                self.initialized = true;
                return cb();
            });
        });
    };
    Server.prototype._startServer = function (cb) {
        var self = this;
        var port = self.system.config.sharedApiPort;
        // use ssl ?
        if (this.system.config.sharedApiSSL.activate) {
            var privateKey = fs.readFileSync(this.system.config.sharedApiSSL.key, 'utf8');
            var certificate = fs.readFileSync(this.system.config.sharedApiSSL.cert, 'utf8');
            this.server = https.createServer({ key: privateKey, cert: certificate }, app);
        }
        else {
            this.server = http.createServer(app);
        }
        this.server.listen(port);
        this.server.on('error', function (error) {
            if (error.syscall !== 'listen') {
                throw error;
            }
            var bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;
            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    break;
                default:
                    break;
            }
            return cb(error);
        });
        this.server.on('listening', function () {
            return cb();
        });
        this.io = io(self.server, {});
        require('./socket')(self, this.io);
    };
    Server.prototype.getConfig = function () {
        return this.config;
    };
    Server.prototype.getLocalAddress = function () {
        return 'https://localhost:' + this.server.address().port;
    };
    return Server;
}(EventEmitter));
exports.Server = Server;

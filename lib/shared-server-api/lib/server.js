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
var events_1 = require("events");
var Services = require("./services");
var self = null;
var Server = (function (_super) {
    __extends(Server, _super);
    function Server(system) {
        var _this = _super.call(this) || this;
        self = _this;
        _this.logger = system.logger.Logger.getLogger('Api server');
        _this.system = system;
        _this.server = null;
        _this.services = {};
        _this.io = null;
        // Include all services
        _.forEach(Services, function (module, key) {
            self.services[key.charAt(0).toLowerCase() + key.slice(1)] = new module(system);
        });
        return _this;
    }
    Server.prototype.initialize = function () {
        return new Promise(function (resolve, reject) {
            require(__dirname + '/bootstrap')(self, app, function (err) {
                if (err) {
                    return reject(err);
                }
                self.startServer(function (err) {
                    if (err) {
                        return reject(err);
                    }
                    self.logger.verbose('Initialized');
                    self.emit("initialized");
                    return resolve();
                });
            });
        });
    };
    Server.prototype.startServer = function (cb) {
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
            self.localAddress = 'https://localhost:' + self.server.address().port;
            return cb();
        });
        this.io = io(self.server, {});
        require('./socket')(self, this.io);
    };
    return Server;
}(events_1.EventEmitter));
exports.Server = Server;

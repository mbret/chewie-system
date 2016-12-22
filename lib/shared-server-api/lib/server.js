'use strict';
let app = require('express')();
let io = require('socket.io');
let https = require('https');
let http = require("http");
let fs = require('fs');
const _ = require("lodash");
let path = require('path');
const events_1 = require("events");
const Services = require("./services");
let self = null;
class Server extends events_1.EventEmitter {
    constructor(system) {
        super();
        self = this;
        this.logger = system.logger.Logger.getLogger('Api server');
        this.system = system;
        this.server = null;
        this.services = {};
        this.io = null;
        _.forEach(Services, function (module, key) {
            self.services[key.charAt(0).toLowerCase() + key.slice(1)] = new module(system);
        });
    }
    initialize() {
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
    }
    startServer(cb) {
        let port = self.system.config.sharedApiPort;
        if (this.system.config.sharedApiSSL.activate) {
            let privateKey = fs.readFileSync(this.system.config.sharedApiSSL.key, 'utf8');
            let certificate = fs.readFileSync(this.system.config.sharedApiSSL.cert, 'utf8');
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
            let bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;
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
    }
}
exports.Server = Server;

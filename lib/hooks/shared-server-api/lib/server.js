'use strict';
let app = require('express')();
let io = require('socket.io');
let https = require('https');
let http = require("http");
let fs = require('fs');
const _ = require("lodash");
let path = require('path');
const Services = require("./services");
const events_watcher_1 = require("./services/events-watcher");
const hook_interface_1 = require("../../../core/hook-interface");
module.exports = class SharedServerApiHook extends hook_interface_1.Hook {
    constructor(system, config) {
        super(system, config);
        let self = this;
        this.logger = system.logger.Logger.getLogger('SharedServerApiHook');
        this.config = config;
        this.system = system;
        this.server = null;
        this.services = {};
        this.io = null;
        this.eventsWatcher = new events_watcher_1.EventsWatcher(this);
        app.locals.system = this.system;
        _.forEach(Services, function (module, key) {
            self.services[key.charAt(0).toLowerCase() + key.slice(1)] = new module(system);
        });
    }
    initialize() {
        let self = this;
        return new Promise(function (resolve, reject) {
            require(__dirname + '/bootstrap')(self, app, function (err) {
                if (err) {
                    return reject(err);
                }
                self.startServer(function (err) {
                    if (err) {
                        return reject(err);
                    }
                    self.eventsWatcher.watch();
                    self.logger.verbose('Initialized');
                    return resolve();
                });
            });
        });
    }
    startServer(cb) {
        let self = this;
        let port = self.config.port;
        if (this.config.ssl.activate) {
            let privateKey = fs.readFileSync(this.config.ssl.key, 'utf8');
            let certificate = fs.readFileSync(this.config.ssl.cert, 'utf8');
            this.server = https.createServer({ key: privateKey, cert: certificate }, app);
        }
        else {
            this.server = http.createServer(app);
        }
        self.server.listen(port);
        this.server
            .on('error', function (error) {
            if (error.syscall !== 'listen') {
                throw error;
            }
            switch (error.code) {
                case 'EADDRINUSE':
                    self.logger.error("It seems that something is already running on port %s. The web server will not be able to start. Maybe a chewie app is already started ?", port);
                    break;
                default:
                    break;
            }
            return cb(error);
        })
            .on('listening', function () {
            self.localAddress = 'https://localhost:' + self.server.address().port;
            self.logger.verbose('The API is available at %s or %s for remote access', self.localAddress, self.system.config.sharedApiUrl);
            return cb();
        });
        this.io = io(self.server, {});
        require('./socket')(self, this.io);
    }
}
;

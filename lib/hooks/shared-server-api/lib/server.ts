'use strict';

let app         = require('express')();
let io          = require('socket.io');
let https       = require('https');
let http = require("http");
let fs          = require('fs');
import * as _ from "lodash";
let path        = require('path');
import * as Services from "./services";
import {EventsWatcher} from "./services/events-watcher";
import {Hook, HookInterface} from "../../../core/hook-interface";
import {System} from "../../../system";

export = class SharedServerApiHook extends Hook implements HookInterface, InitializeAbleInterface {

    io: any;
    logger: any;
    server: any;
    services: any;
    system: System;
    localAddress: string;
    // set once the server is started and listening
    eventsWatcher: EventsWatcher;

    constructor(system){
        super(system);
        let self = this;
        this.logger = system.logger.Logger.getLogger('Api server');

        this.system = system;
        this.server = null;
        this.services = {};
        this.io = null;

        this.eventsWatcher = new EventsWatcher(this);

        // export system to request handler
        app.locals.system = this.system;

        // Include all services
        _.forEach(Services, function(module, key) {
            self.services[key.charAt(0).toLowerCase() + key.slice(1)] = new module(system);
        });
    }

    initialize(){
        let self = this;
        return new Promise(function(resolve, reject) {
            require(__dirname + '/bootstrap')(self, app, function(err){
                if(err){
                    return reject(err);
                }

                // setTimeout(function() {
                    self.startServer(function(err){
                        if(err){
                            return reject(err);
                        }

                        self.eventsWatcher.watch();

                        self.logger.verbose('Initialized');
                        // self.emit("initialized");

                        return resolve();
                    });
                // }, 5000);
            });
        });
    }

    startServer(cb){
        let self = this;
        let port = self.system.config.sharedApiPort;

        // use ssl ?
        if (this.system.config.sharedApiSSL.activate) {
            let privateKey = fs.readFileSync(this.system.config.sharedApiSSL.key, 'utf8');
            let certificate = fs.readFileSync(this.system.config.sharedApiSSL.cert, 'utf8');
            this.server = https.createServer({key: privateKey, cert: certificate}, app);
        } else {
            this.server = http.createServer(app);
        }

        this.server.listen(port);

        this.server.on('error', function(error){
            if (error.syscall !== 'listen') {
                throw error;
            }

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EADDRINUSE':
                    self.logger.error("It seems that something is already running on port %s. The web server will not be able to start. Maybe a chewie app is already started ?", port);
                    break;
                default:
                    break;
            }
            return cb(error);
        });

        this.server.on('listening', function(){
            self.localAddress = 'https://localhost:' + self.server.address().port;
            self.logger.verbose('The API is available at %s or %s for remote access', self.localAddress, self.system.config.sharedApiUrl);
            return cb();
        });

        this.io = io(self.server, {});
        require('./socket')(self, this.io);
    }
}
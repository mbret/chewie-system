'use strict';

let app         = require('express')();
let io          = require('socket.io');
let https       = require('https');
let http = require("http");
let fs          = require('fs');
import * as _ from "lodash";
let path        = require('path');
let localConfig = require("../hook-config");
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
    config: any;
    // set once the server is started and listening
    eventsWatcher: EventsWatcher;

    constructor(system, userHookConfig){
        super(system, userHookConfig);
        let self = this;
        this.logger = system.logger.getLogger('SharedServerApiHook');
        this.config = _.merge(localConfig, {
            storageFilePath: path.join(system.config.system.appDataPath, "storage", localConfig.storageFileName)
        }, userHookConfig);
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

        // log various paths for debug conveniences
        self.logger.verbose("Storage file is located to %s", self.config.storageFilePath);
    }

    initialize(){
        let self = this;
        let bootstrap = require(__dirname + '/bootstrap');
        return bootstrap(self, app)
            .then(function(){

                // setTimeout(function() {
                return self.startServer().then(function(){
                    self.eventsWatcher.watch();
                    self.logger.verbose('Initialized');
                    // self.emit("initialized");
                    return Promise.resolve();
                });
                // }, 5000);
            });
    }

    startServer(){
        let self = this;
        let port = self.config.port;

        // use ssl ?
        if (this.config.ssl.activate) {
            let privateKey = fs.readFileSync(this.config.ssl.key, 'utf8');
            let certificate = fs.readFileSync(this.config.ssl.cert, 'utf8');
            this.server = https.createServer({key: privateKey, cert: certificate}, app);
        } else {
            this.server = http.createServer(app);
        }

        self.server.listen(port);

        this.io = io(self.server, {});
        require('./socket')(self, this.io);

        return new Promise(function(resolve, reject) {
            self.server
                .on('error', function(error){
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
                    return reject(error);
                })
                .on('listening', function(){
                    self.localAddress = 'https://localhost:' + self.server.address().port;
                    self.logger.verbose('The API is available at %s or %s for remote access', self.localAddress, self.system.config.sharedApiUrl);
                    return resolve();
                });
        });
    }
}
"use strict";

import {EventEmitter}  from "events";
import {System} from "../../system";
let io = require('socket.io-client');
let self = null;

/**
 *
 */
export class CommunicationBus extends EventEmitter implements InitializeAbleInterface {

    system: System;
    socket: any;
    logger: any;
    sharedApiEndpoint: string;

    constructor(system) {
        super();
        self = this;
        this.system = system;
        this.socket = null;
        this.logger = system.logger.getLogger('CommunicationBus');
        this.sharedApiEndpoint = this.system.config.sharedApiUrl;
    }

    initialize() {
        let self = this;

        // wait for shared api to be initialized
        self.system.on("ready", function() {

            // rejectUnauthorized is needed for self signed certificate
            self.socket = io.connect(self.sharedApiEndpoint, {reconnect: true, rejectUnauthorized: false});

            self.socket.on('connect', function() {
                self.onConnect();
                self.logger.verbose("Initialized");
            });

            self.socket.on('connect_error', function(err) {
                self.logger.error("An error occurred while trying to connect to shared api", err);
            });
        });

        return Promise.resolve();
    }

    onConnect() {
        this.logger.verbose("connected to shared api server at %s", this.sharedApiEndpoint);
        this.socket
            .on("user:plugin:created", self.emit.bind(self, "user:plugin:created"))
            .on("user:plugin:deleted", self.emit.bind(self, "user:plugin:deleted"))
            .on("user:scenario:created", self.emit.bind(self, "user:scenario:created"))
            .on("scenario:deleted", self.emit.bind(self, "scenario:deleted"));
    }
}
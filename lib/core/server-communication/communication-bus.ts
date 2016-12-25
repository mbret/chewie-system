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
                self.logger.verbose("Initialized");
            });

            self.socket.on('connect_error', function(err) {
                self.logger.error("An error occurred while trying to connect to shared api", err);
            });
        });

        return Promise.resolve();
    }
}
"use strict";

import {EventEmitter}  from "events";
import {Daemon} from "../../daemon";
var io = require('socket.io-client');
let self = null;

/**
 *
 */
export class CommunicationBus extends EventEmitter {

    system: Daemon;
    socket: any;
    logger: any;
    sharedApiEndpoint: string;

    constructor(system) {
        super();
        self = this;
        this.system = system;
        this.socket = null;
        this.logger = system.logger.getLogger('CommunicationBus');
        this.sharedApiEndpoint = this.system.config.apiEndpointAddress;
    }

    initialize(cb) {
        // rejectUnauthorized is needed for self signed certificate
        this.socket = io.connect(this.sharedApiEndpoint, {reconnect: true, rejectUnauthorized: false});
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('connect_error', this.onConnectError);

        return cb();
    }

    onConnect() {
        this.logger.verbose("connected to shared api server at %s", this.sharedApiEndpoint);
        this.socket
            .on("user:plugin:created", self.emit.bind(self, "user:plugin:created"))
            .on("user:plugin:deleted", self.emit.bind(self, "user:plugin:deleted"))
            .on("user:scenario:created", self.emit.bind(self, "user:scenario:created"));
    }

    onConnectError(err) {
        console.error(err);
    }
}
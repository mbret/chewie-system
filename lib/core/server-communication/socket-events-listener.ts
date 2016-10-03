"use strict";

import {EventEmitter}  from "events";
import {Daemon} from "../../daemon";
var io = require('socket.io-client');

/**
 *
 */
export class SocketEventsListener extends EventEmitter {

    system: Daemon;
    socket: any;

    constructor(system) {
        super();
        this.system = system;
        this.socket = null;
    }

    initialize(cb) {
        // rejectUnauthorized is needed for self signed certificate
        this.socket = io.connect(this.system.config.apiEndpointAddress, {reconnect: true, rejectUnauthorized: false});
        this.socket.on('connect', this.onConnect);
        this.socket.on('connect_error', this.onConnectError);

        return cb();
    }

    onConnect() {
        console.log("api server connected via socket");
    }

    onConnectError(err) {
        console.error(err);
    }
}
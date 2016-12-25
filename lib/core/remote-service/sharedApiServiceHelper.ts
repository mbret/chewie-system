"use strict";

import RemoteServiceHelper from "./remote-service-helper";
import {System} from "../../system";
let io = require('socket.io-client');

export class SharedApiServiceHelper extends RemoteServiceHelper implements InitializeAbleInterface {

    io: any;
    loggerSocket: any;

    constructor(system: System) {
        super(system);
        this.loggerSocket = system.logger.getLogger('SharedApiServiceHelper:socket');
        let self = this;
        this.io = io.connect(this.system.config.sharedApiUrl, {reconnect: true, rejectUnauthorized: false});

        self.io.on('connect', function() {
            self.loggerSocket.verbose("Connected to shared api server and listening");
        });

        self.io.on('connect_error', function() {
            self.loggerSocket.verbose("Unable to connect to shared api server socket, trying again..");
        });
    }

    initialize() {
        let self = this;

        return Promise.resolve();
    }

    createNotification(content, type = "info") {
        return this.post("/notifications", {content: content, type: type, from: this.system.id});
    }

    getAllScenarios() {
        return this.get("/devices/" + this.system.id + "/scenarios");
    }

    getAllPlugins() {
        return this.get("/devices/" + this.system.id + "/plugins");
    }
}
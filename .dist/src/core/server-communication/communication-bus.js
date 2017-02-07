"use strict";
const events_1 = require("events");
let io = require('socket.io-client');
let self = null;
class CommunicationBus extends events_1.EventEmitter {
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
        self.system.on("ready", function () {
        });
        return Promise.resolve();
    }
}
exports.CommunicationBus = CommunicationBus;
//# sourceMappingURL=communication-bus.js.map
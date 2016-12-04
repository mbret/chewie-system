"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("events");
var io = require('socket.io-client');
var self = null;
/**
 *
 */
var CommunicationBus = (function (_super) {
    __extends(CommunicationBus, _super);
    function CommunicationBus(system) {
        _super.call(this);
        self = this;
        this.system = system;
        this.socket = null;
        this.logger = system.logger.getLogger('CommunicationBus');
        this.sharedApiEndpoint = this.system.config.sharedApiUrl;
    }
    CommunicationBus.prototype.initialize = function (cb) {
        // rejectUnauthorized is needed for self signed certificate
        this.socket = io.connect(this.sharedApiEndpoint, { reconnect: true, rejectUnauthorized: false });
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('connect_error', this.onConnectError);
        return cb();
    };
    CommunicationBus.prototype.onConnect = function () {
        this.logger.verbose("connected to shared api server at %s", this.sharedApiEndpoint);
        this.socket
            .on("user:plugin:created", self.emit.bind(self, "user:plugin:created"))
            .on("user:plugin:deleted", self.emit.bind(self, "user:plugin:deleted"))
            .on("user:scenario:created", self.emit.bind(self, "user:scenario:created"))
            .on("scenario:deleted", self.emit.bind(self, "scenario:deleted"));
    };
    CommunicationBus.prototype.onConnectError = function (err) {
        console.error(err);
    };
    return CommunicationBus;
}(events_1.EventEmitter));
exports.CommunicationBus = CommunicationBus;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("events");
var io = require('socket.io-client');
var self = null;
var CommunicationBus = (function (_super) {
    __extends(CommunicationBus, _super);
    function CommunicationBus(system) {
        var _this = _super.call(this) || this;
        self = _this;
        _this.system = system;
        _this.socket = null;
        _this.logger = system.logger.getLogger('CommunicationBus');
        _this.sharedApiEndpoint = _this.system.config.sharedApiUrl;
        return _this;
    }
    CommunicationBus.prototype.initialize = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.system.sharedApiServer.on("initialized", function () {
                self.socket = io.connect(self.sharedApiEndpoint, { reconnect: true, rejectUnauthorized: false });
                self.socket.on('connect', function () {
                    self.onConnect();
                    self.logger.verbose("Initialized");
                    return resolve();
                });
                self.socket.on('connect_error', function (err) {
                    self.logger.error("An error occurred while trying to connect to shared api", err);
                    return reject();
                });
            });
        });
    };
    CommunicationBus.prototype.onConnect = function () {
        this.logger.verbose("connected to shared api server at %s", this.sharedApiEndpoint);
        this.socket
            .on("user:plugin:created", self.emit.bind(self, "user:plugin:created"))
            .on("user:plugin:deleted", self.emit.bind(self, "user:plugin:deleted"))
            .on("user:scenario:created", self.emit.bind(self, "user:scenario:created"))
            .on("scenario:deleted", self.emit.bind(self, "scenario:deleted"));
    };
    return CommunicationBus;
}(events_1.EventEmitter));
exports.CommunicationBus = CommunicationBus;

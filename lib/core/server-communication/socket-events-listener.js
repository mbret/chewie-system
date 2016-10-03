"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("events");
var io = require('socket.io-client');
/**
 *
 */
var SocketEventsListener = (function (_super) {
    __extends(SocketEventsListener, _super);
    function SocketEventsListener(system) {
        _super.call(this);
        this.system = system;
        this.socket = null;
    }
    SocketEventsListener.prototype.initialize = function (cb) {
        // rejectUnauthorized is needed for self signed certificate
        this.socket = io.connect(this.system.config.apiEndpointAddress, { reconnect: true, rejectUnauthorized: false });
        this.socket.on('connect', this.onConnect);
        this.socket.on('connect_error', this.onConnectError);
        return cb();
    };
    SocketEventsListener.prototype.onConnect = function () {
        console.log("api server connected via socket");
    };
    SocketEventsListener.prototype.onConnectError = function (err) {
        console.error(err);
    };
    return SocketEventsListener;
}(events_1.EventEmitter));
exports.SocketEventsListener = SocketEventsListener;

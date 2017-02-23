"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util = require("util");
var remote_service_helper_1 = require("./remote-service-helper");
var response_error_1 = require("./response-error");
var io = require('socket.io-client');
var SharedApiServiceHelper = (function (_super) {
    __extends(SharedApiServiceHelper, _super);
    function SharedApiServiceHelper(system) {
        var _this = _super.call(this, system) || this;
        _this.loggerSocket = system.logger.getLogger('SharedApiServiceHelper:socket');
        var self = _this;
        _this.io = io.connect(_this.system.config.sharedApiUrl, { reconnect: true, rejectUnauthorized: false });
        self.io
            .on('connect', function () {
            self.loggerSocket.verbose("Connected to shared api server and listening");
        })
            .on('connect_error', function () {
            self.loggerSocket.verbose("Unable to connect to shared api server socket, trying again..");
        })
            .on('connect_failed', function (err) {
            self.loggerSocket.verbose("Connection failed", err);
        })
            .on("error", function (err) {
            self.loggerSocket.verbose("Generic error", err);
        });
        return _this;
    }
    SharedApiServiceHelper.prototype.initialize = function () {
        return Promise.resolve();
    };
    SharedApiServiceHelper.prototype.createNotification = function (content, type) {
        if (type === void 0) { type = "info"; }
        return this.post("/notifications", { content: content, type: type, from: this.system.id });
    };
    SharedApiServiceHelper.prototype.getAllScenarios = function () {
        return this.get("/devices/" + this.system.id + "/scenarios");
    };
    SharedApiServiceHelper.prototype.getAllPlugins = function () {
        return this.get("/devices/" + this.system.id + "/plugins");
    };
    /**
     *
     * @param pluginId
     * @returns {*}
     */
    SharedApiServiceHelper.prototype.getPlugin = function (pluginId) {
        return this.get(util.format("/devices/%s/plugins/%s", this.system.id, pluginId))
            .then(function (response) {
            if (response.statusCode !== 200) {
                return null;
            }
            return response.body;
        });
    };
    SharedApiServiceHelper.prototype.getScenario = function (id) {
        return this.get(util.format("/devices/%s/scenarios/%s", this.system.id, id))
            .then(function (response) {
            return response.body;
        })
            .catch(function (err) {
            if (err instanceof response_error_1.ApiResponseNotFoundError) {
                return null;
            }
            throw err;
        });
    };
    return SharedApiServiceHelper;
}(remote_service_helper_1.default));
exports.SharedApiServiceHelper = SharedApiServiceHelper;

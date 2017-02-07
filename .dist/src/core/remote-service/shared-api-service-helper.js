"use strict";
let util = require("util");
const remote_service_helper_1 = require("./remote-service-helper");
const response_error_1 = require("./response-error");
let io = require('socket.io-client');
class SharedApiServiceHelper extends remote_service_helper_1.default {
    constructor(system) {
        super(system);
        this.loggerSocket = system.logger.getLogger('SharedApiServiceHelper:socket');
        let self = this;
        this.io = io.connect(this.system.config.sharedApiUrl, { reconnect: true, rejectUnauthorized: false });
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
    }
    initialize() {
        return Promise.resolve();
    }
    createNotification(content, type = "info") {
        return this.post("/notifications", { content: content, type: type, from: this.system.id });
    }
    getAllScenarios() {
        return this.get("/devices/" + this.system.id + "/scenarios");
    }
    getAllPlugins() {
        return this.get("/devices/" + this.system.id + "/plugins");
    }
    getPlugin(pluginId) {
        return this.get(util.format("/devices/%s/plugins/%s", this.system.id, pluginId))
            .then(function (response) {
            if (response.statusCode !== 200) {
                return null;
            }
            return response.body;
        });
    }
    getScenario(id) {
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
    }
}
exports.SharedApiServiceHelper = SharedApiServiceHelper;
//# sourceMappingURL=shared-api-service-helper.js.map
"use strict";

let util = require("util");
import RemoteServiceHelper from "./remote-service-helper";
import {System} from "../../system";
import {ApiResponseError, ApiResponseNotFoundError} from "./response-error";
let io = require('socket.io-client');

export class SharedApiServiceHelper extends RemoteServiceHelper {

    io: any;
    loggerSocket: any;
    protected _apiReady: boolean;

    constructor(system: System) {
        super(system);
        this.loggerSocket = system.logger.getLogger('SharedApiServiceHelper:socket');
        this.io = io.connect(this.system.config.sharedApiUrl, {reconnect: true, rejectUnauthorized: false});
        this._apiReady = false;

        // let self = this;
        // self.io
        //     .on('connect', function() {
        //         self.loggerSocket.verbose("Connected to shared api server and listening");
        //     })
        //     .on('connect_error', function() {
        //         self.loggerSocket.verbose("Unable to connect to shared api server socket, trying again..");
        //     })
        //     .on('connect_failed', function(err) {
        //         self.loggerSocket.verbose("Connection failed", err);
        //     })
        //     .on("error", function(err) {
        //         self.loggerSocket.verbose("Generic error", err);
        //     });
    }

    initialize() {
        let self = this;

        self._tryToPing()
            .then(function() {
                self._apiReady = true;
                self.emit("apiReady");
            })
            .catch(function(err) {
                self.logger.warn("Error while listening for apiReading event. The api will not be set as ready!", err);
            });

        // on api ready run socket
        self.on("apiReady", function() {
            self.io
                .on('connect', function() {
                    self.loggerSocket.verbose("Connected to shared api server and listening");
                })
                .on('connect_error', function() {
                    self.loggerSocket.verbose("Unable to connect to shared api server socket, trying again..");
                })
                .on('connect_failed', function(err) {
                    self.loggerSocket.verbose("Connection failed", err);
                })
                .on("error", function(err) {
                    self.loggerSocket.verbose("Generic error", err);
                });
        });

        return Promise.resolve();
    }

    protected _tryToPing() {
        let self = this;
        return self.get("/ping")
            .catch(function(err) {
                if (err.code === "ECONNREFUSED") {
                    return self._tryToPing();
                } else {
                    throw err;
                }
            });
    }

    public apiReady(): Promise<any> {
        let self = this;
        if (this._apiReady) {
            return Promise.resolve();
        } else {
            return new Promise(function(resolve) {
                self.on("apiReady", resolve);
            });
        }
    }

    createNotification(content, type = "info") {
        return this.post("/notifications", {content: content, type: type, from: this.system.id});
    }

    getAllScenarios() {
        return this.get("/devices/" + this.system.id + "/scenarios");
    }

    deletePlugin(pluginName: string) {
        return this.delete(util.format("/devices/%s/plugins/%s", this.system.id, pluginName))
    }

    getAllPlugins() {
        return this.get("/devices/" + this.system.id + "/plugins");
    }

    postHookData(hookName: string, key: string, data: any) {
        return this.post("/devices/" + this.system.id + "/hooks/" + hookName + "/data", {key: key, data: data});
    }

    putHookData(hookName: string, key: string, data: any, options: any) {
        return this.put("/devices/" + this.system.id + "/hooks/" + hookName + "/data/" + key, {data: data, partial: options.partial});
    }

    getHookData(hookName: string, key: string) {
        return this.get("/devices/" + this.system.id + "/hooks/" + hookName + "/data/" + key);
    }

    /**
     * @param pluginId
     * @returns {*}
     */
    getPlugin(pluginId) {
        return this.get(util.format("/devices/%s/plugins/%s", this.system.id, pluginId))
            .then(function(response: any) {
                return response.body;
            })
            .catch(function(err) {
                if (err instanceof ApiResponseNotFoundError) {
                    return null;
                }
                throw err;
            });
    }

    postPlugin(data: any) {
        return this.post(util.format("/devices/%s/plugins", this.system.id), data);
    }

    getScenario(id) {
        return this.get(util.format("/devices/%s/scenarios/%s", this.system.id, id))
            .then(function(response: any) {
                return response.body;
            })
            .catch(function(err: ApiResponseError) {
                if (err instanceof ApiResponseNotFoundError) {
                    return null;
                }
                throw err;
            });
    }
}
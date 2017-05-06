"use strict";

let util = require("util");
import RemoteServiceHelper from "./remote-service-helper";
import {System} from "../../system";
import {ApiResponseError, ApiResponseNotFoundError} from "./response-error";
let io = require('socket.io-client');
import {debug} from "../../shared/debug";
import _ = require("lodash");

export class SharedApiServiceHelper extends RemoteServiceHelper {

    io: any;
    loggerSocket: any;
    protected _apiReady: boolean;

    constructor(system: System) {
        super(system);
        this.loggerSocket = system.logger.getLogger('SharedApiServiceHelper:socket');
        this.io = io.connect(this.system.config.sharedApiUrl, {reconnect: true, rejectUnauthorized: false});
        this._apiReady = false;
    }

    protected buildOptions(userOptions): any {
        // fetch auth token
        let authToken: any = this.system.persistenceService.entries.findOne({ name: 'auth.token' });
        if (authToken.value) {
            debug("system:shared-api-service")(`Auth token ${authToken.value.substring(0, 10)}... found injected into request`);
            userOptions = _.merge({}, userOptions, {
                headers: { 'Authorization': `Bearer ${authToken.value}` }
            });
        }
        return super.buildOptions(userOptions);
    }

    protected replaceToken(newToken) {
        let existingToken: any = this.system.persistenceService.entries.findOne({ name: 'auth.token' });
        existingToken.value = newToken;
        // got new token so we reset refresh
        let existingRefreshToken: any = this.system.persistenceService.entries.findOne({ name: 'auth.refreshToken' });
        existingRefreshToken.value = null;
        this.system.persistenceService.entries.update(existingToken);
        this.system.persistenceService.entries.update(existingRefreshToken);
        this.system.persistenceService.db.saveDatabase();
    }

    protected _tryToPing() {
        let self = this;
        return self.get("/ping")
            .catch(function(err) {
                if (err.code === "ECONNREFUSED") {
                    return new Promise(function(resolve, reject) {
                        // wait 1 second for next call
                        setTimeout(() => self._tryToPing().then(resolve).catch(reject), 1000)
                    });
                } else {
                    throw err;
                }
            });
    }

    public initialize(authToken = null): Promise<any> {
        let self = this;

        self._tryToPing()
            .then(function(response: any) {
                self._apiReady = true;
                self.emit("apiReady", {version: response.headers["chewie-version"]});
            })
            .catch(function(err) {
                self.logger.warn("Error while listening for apiReading event. The api will not be set as ready!", err);
            });

        // on api ready run socket
        self.on("apiReady", function(serverInfo) {
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

        // For now we need the shared api server to be connected
        debug("system:shared-api-service")("We now wait for api to be ready...");

        return self.system.sharedApiService.apiReady()
            .then(function() {
                debug("system:shared-api-service")("Api is online.");
                // We are gonna check auth with current token.
                // We use stored token, so if a token is provided as argument we store it before
                if (authToken) {
                    self.replaceToken(authToken);
                }
                return self.system.sharedApiService.getAuthStatus()
                    .then(function(info) {
                        // if (info.status !== "authorized") {
                        //     self.system.logger.error(`The system is not authenticated with the api. Please verify the validity of auth token!`);
                        //     // return self.system.shutdown();
                        //     throw new Error('Api not authenticated');
                        // }
                    });
            });
    }

    /**
     * Validate the promise as soon as the api is responding.
     */
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

    public createNotification(content, type = "info") {
        return this.post("/notifications", {content: content, type: type, from: this.system.id});
    }

    public getAllScenarios() {
        return this.get("/devices/" + this.system.id + "/scenarios");
    }

    public deletePlugin(pluginName: string) {
        return this.delete(util.format("/devices/%s/plugins/%s", this.system.id, pluginName))
    }

    public getAllPlugins() {
        return this.get("/devices/" + this.system.id + "/plugins");
    }

    public postHookData(hookName: string, key: string, data: any) {
        return this.post("/devices/" + this.system.id + "/hooks/" + hookName + "/data", {key: key, data: data});
    }

    public putHookData(hookName: string, key: string, data: any, options: any) {
        return this.put("/devices/" + this.system.id + "/hooks/" + hookName + "/data/" + key, {data: data, partial: options.partial});
    }

    public getHookData(hookName: string, key: string) {
        return this.get("/devices/" + this.system.id + "/hooks/" + hookName + "/data/" + key);
    }

    /**
     * @param pluginId
     * @returns {*}
     */
    public getPlugin(pluginId) {
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

    public postPlugin(data: any) {
        return this.post(util.format("/devices/%s/plugins", this.system.id), data);
    }

    public getScenario(id) {
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

    public getHookConfigData(name) {
        return this.get("/devices/" + this.system.id + "/hooks-config/" + name)
            .then(function(response: any) {
                return response.body.data;
            })
            .catch(function(err) {
                if (err instanceof ApiResponseNotFoundError) {
                    return Promise.resolve(null);
                }
                throw err;
            });
    }

    public getSystemConfig() {
        return this.get("/system-config/" + this.system.id)
            .then(function(response: any) {
                return response.body.data;
            })
            .catch(function(err) {
                if (err instanceof ApiResponseNotFoundError) {
                    return Promise.resolve({});
                }
                throw err;
            });
    }

    public getAuthStatus() {
        return this.get("/auth/status").then((response: any) => response.body);
    }
}
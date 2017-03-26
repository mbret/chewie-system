"use strict";

let util = require("util");
import RemoteServiceHelper from "./remote-service-helper";
import {System} from "../../system";
import {ApiResponseError, ApiResponseNotFoundError} from "./response-error";
let io = require('socket.io-client');
import * as _ from "lodash";

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
                    return new Promise(function(resolve, reject) {
                        // wait 1 second for next call
                        setTimeout(() => self._tryToPing().then(resolve).catch(reject), 1000)
                    });
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

    getHookConfigData(name) {
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

    // findUserByUsername(username) {
    //     return this.get(util.format("/users/%s", username))
    //         .then(function(response) {
    //             if(response.statusCode !== 200) {
    //                 return null;
    //             }
    //             return response.body;
    //         });
    // }

    // findAllTasksByUser(userId) {
    //     return this.get(util.format("/users/%s/tasks", userId))
    //         .then(function(response) {
    //             if(response.statusCode !== 200) {
    //                 return null;
    //             }
    //             return response.body;
    //         });
    // }

    // findOrCreatePlugin(userId, pluginIdOrName, data) {
    //     var self = this;
    //     return this.findPlugin(userId, pluginIdOrName)
    //         .then(function(plugin) {
    //             if(!plugin) {
    //                 return self.createPlugin(userId, data);
    //             }
    //             return plugin;
    //         });
    // }

    // createOrUpdatePlugin(userId, pluginId, data) {
    //     var self = this;
    //     return this.findPlugin(userId, pluginId)
    //         .then(function(plugin) {
    //             if(!plugin) {
    //                 return self.createPlugin(userId, data);
    //             }
    //             return self.updatePlugin(userId, pluginId, data);
    //         });
    // }

    // updatePlugin(userId, pluginIdOrName, data) {
    //     var self = this;
    //     return self.put(util.format("/users/%s/plugins/%s", userId, pluginIdOrName), data)
    //         .then(function(response) {
    //             // We only should get 200 / 400
    //             if(response.statusCode !== 200) {
    //                 return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
    //             }
    //             return response.body;
    //         });
    // }

    // createPlugin(userId, data) {
    //     data.userId = userId;
    //     return this.post(util.format("/users/%s/plugins", userId), data)
    //         .then(function(response) {
    //             // We only should get 201 / 400
    //             if(response.statusCode !== 201) {
    //                 return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
    //             }
    //             return response.body;
    //         });
    // }

    // createUser(data) {
    //     return this.post("/users", data)
    //         .then(function(response) {
    //             // We only should get 201 / 400
    //             if(response.statusCode !== 201) {
    //                 return Promise.reject(ApiResponseError.BuildErrorFromResponse(response));
    //             }
    //             return response.body;
    //         });
    // }

    // findOrCreateUser(data) {
    //     var self = this;
    //     return this.findUserByUsername(data.username)
    //         .then(function(user) {
    //             if (!user) {
    //                 return self.createUser(data);
    //             }
    //             return user;
    //         });
    // }

    // findModuleByName(userId, pluginId, moduleName) {
    //     return this.get(util.format("/users/%s/plugins/%s/modules/%s", userId, pluginId, moduleName))
    //         .then(function(response) {
    //             if(response.statusCode !== 200) {
    //                 return null;
    //             }
    //             return response.body;
    //         });
    // }
}
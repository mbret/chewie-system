import {System} from "../system";
import { EventEmitter }  from "events";

/**
 *
 */
export class HookHelper extends EventEmitter {
    system: System;
    hookName: string;
    logger: any;
    ready: boolean;

    constructor(system, hookName) {
        super();
        let self = this;
        this.system = system;
        this.hookName = hookName;
        this.ready = false;
        this.logger = this.system.logger.getLogger(hookName);
        this.system.once("hook:shared-server-api:initialized", function() {
            self.ready = true;
            self.emit("ready");
        });
    }
    
    protected _apiReady(): Promise<any> {
        let self = this;
        if (this.ready) {
            return Promise.resolve();
        }
        return new Promise(function(resolve) {
            self.once("ready", resolve);
        });
    }

    /**
     * Init or return a storage data.
     * @param key
     * @param data
     * @returns {Promise}
     */
    public initStorage(key: string, data: any) {
        let self = this;
        return self.getStorage(key)
            .then(function(res) {
                if (res) {
                    return res;
                }
                return self.setStorage(key, data);
            })
    }

    /**
     * Create or set a storage for a key.
     * @param key
     * @param data
     * @param options
     * @returns {Promise}
     */
    public setStorage(key: string, data: any, options: any = {partial: false}) {
        let self = this;
        return this._apiReady()
            .then(function() {
                return self.system.sharedApiService
                    .postHookData(self.hookName, key, data)
                    .catch(function(err) {
                        if (err.data.code === "alreadyExist") {
                            return self.system.sharedApiService.putHookData(self.hookName, key, data, options);
                        }
                        throw err;
                    });
            });
    }

    public getStorage(key: string) {
        let self = this;
        return this._apiReady()
            .then(function() {
                return self.system.sharedApiService.getHookData(self.hookName, key)
                    .then(function(response: any) {
                        // we only return attribute data from the model
                        return response.data.data;
                    })
                    .catch(function(err) {
                        if (err.status === 404) {
                            return null;
                        }
                        throw err;
                    });
            });
    }
}
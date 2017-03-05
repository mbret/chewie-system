import {System} from "../system";
import { EventEmitter }  from "events";

/**
 *
 */
export class HookHelper extends EventEmitter {
    system: System;
    hookName: string;
    logger: any;

    constructor(system, hookName) {
        super();
        let self = this;
        this.system = system;
        this.hookName = hookName;
        this.logger = this.system.logger.getLogger(hookName);
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
     * It use sharedApiService.apiReady() as security in case of user hook would call this method before system ready.
     * Create or set a storage for a key.
     * @param key
     * @param data
     * @param options
     * @returns {Promise}
     */
    public setStorage(key: string, data: any, options: any = {partial: false}) {
        let self = this;
        return this.system.sharedApiService.apiReady()
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

    /**
     * It use sharedApiService.apiReady() as security in case of user hook would call this method before system ready.
     * @param key
     * @returns {Promise<U>}
     */
    public getStorage(key: string) {
        let self = this;
        return this.system.sharedApiService.apiReady()
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
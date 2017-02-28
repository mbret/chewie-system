import {System} from "../system";

/**
 *
 */
export class HookHelper {
    system: System;
    hookName: string;
    logger: any;

    constructor(system, hookName) {
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
        return this.getStorage(key)
            .then(function(res) {
                if (res) {
                    return res;
                }
                return self.setStorage(key, data);
            });
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
        return this.system.sharedApiService
            .postHookData(this.hookName, key, data)
            .catch(function(err) {
                if (err.data.code === "alreadyExist") {
                    return self.system.sharedApiService.putHookData(self.hookName, key, data, options);
                }
                throw err;
            });
    }

    public getStorage(key: string) {
        return this.system.sharedApiService.getHookData(this.hookName, key)
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
    }
}
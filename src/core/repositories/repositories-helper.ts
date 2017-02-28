import {System} from "../../system";
import _  = require('lodash');
import {debug} from "../../shared/debug";
import {SystemError} from "../error";

/**
 *
 */
export class RepositoriesHelper {
    system: System;

    constructor(system) {
        this.system = system;
    }

    public installPluginFromDisk(pathToModule) {
        return this._installPluginFromDisk(pathToModule, {});
    }

    public reinstallPluginFromDisk(pathToModule) {
        return this._installPluginFromDisk(pathToModule, {reinstall: true});
    }

    /**
     * Option reinstall will delete and save again the plugin. It will trigger physical installation.
     * @param pathToModule
     * @param options
     * @returns {Promise<U>}
     */
    protected _installPluginFromDisk(pathToModule, options: any = {}) {
        let self = this;
        let name = null;
        options = _.merge({
            reinstall: false
        }, options);
        return this.system.localRepository
            // first retrieve info about the plugin
            .getPluginInfoByDir(pathToModule)
            .then(function(info: any) {
                name = info.name;
                if (options.reinstall) {
                    debug("repositories:helper")("Reinstalling plugin %s", info.name);
                    // fetch first
                    return self.system.sharedApiService.getPlugin(info.name)
                        .then(function(plugin) {
                            if (plugin) {
                                // delete and create
                                debug("repositories:helper")("Plugin %s exist on storage and will be deleted and then created again", info.name);
                                return self.system.sharedApiService.deletePlugin(info.name)
                                    .then(function() {
                                        return post(info);
                                    });
                            } else {
                                // create
                                return post(info);
                            }
                        });
                } else {
                    debug("repositories")("Installing plugin %s", info.name);
                    // create
                    return post(info);
                }
            })
            .catch(function(err) {
                return Promise.reject(new SystemError("Unable to install plugin " + name + " because of: " + err.message, null, err));
            });

        function post(packageInfo) {
            return self.system.sharedApiService
                .postPlugin({
                    name: packageInfo.name,
                    repository: "source",
                    version: packageInfo.version,
                    "package": packageInfo,
                    source: pathToModule
                })
                .then(function () {
                    debug("repositories:helper")("Plugin %s saved on storage", packageInfo.name);
                    return packageInfo;
                })
                .catch(function(err) {
                    // console.log(err.data.data);
                    throw err;
                });
        }
    }
}
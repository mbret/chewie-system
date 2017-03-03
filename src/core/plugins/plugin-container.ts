'use strict';

import {System} from "../../system";
import {PluginInstance} from "./plugin-instance-interface";
import {Plugin} from "../../hooks/shared-server-api/lib/models/plugins";
import {PluginHelper} from "./plugin-helper";
import {EventEmitter}  from "events";
import {SystemError} from "../error";
const Semaphore = require('semaphore');
import {debug} from "../../shared/debug";
import * as path from "path"
import {PluginInstanceDefault} from "./plugin-instance-default";
const decache = require('decache');
import * as Promise from "bluebird";

export class PluginContainer extends EventEmitter {

    system: System;
    plugin: Plugin;
    instance: PluginInstance;
    logger: any;
    shared: any;
    state: string;
    helper: PluginHelper;
    semaphore: any;
    queue: any;
    instanceLocked: boolean;
    protected _beforeMount: Array<Function>;
    protected _beforeUnmount: Array<Function>;

    constructor(system, plugin: Plugin) {
        super();
        this.system = system;
        this.logger = this.system.logger.getLogger('PluginContainer');
        this.plugin = plugin;
        this.shared = {};
        this.state = null; // null/mounting/mounted/unmounting/unmounted
        this.semaphore = Semaphore(1);
        this.helper = new PluginHelper(this.system, this);
        this.instance = this.getPluginInstance();
        this.instanceLocked = false;
        this._beforeMount = [];
        this._beforeUnmount = [];
    }

    public isMounted() {
        return this.state === "mounted";
    }

    public isMounting() {
        return this.state === "mounting";
    }

    public isUnmounted() {
        return this.state === "unmounted";
    }

    public isUnmounting() {
        return this.state === "unmounting";
    }

    public beforeMount(fn: Function) {
        this._beforeMount.push(fn);
    }

    public beforeUnmount(fn: Function) {
        this._beforeUnmount.push(fn);
    }

    public mount() {
        let self = this;
        return (new Promise(
            function(resolve, reject) {
                self.semaphore.take(function() {
                    // State should only be null/unmounted/mounted. In case of
                    // - null -> container created ok
                    // - mounting -> something went wrong when mounting -> exception
                    // - mounted -> normal demand we just ignore
                    // - unmounted -> you cannot mount again an unmounted container -> exception
                    // - unmounting -> Unexpected state of container -> exception
                    if (self.isMounted()) {
                        return resolve(self);
                    } else if (self.isUnmounted()) {
                        return reject(new SystemError("Impossible to remount", "unableToRemount"));
                    } else if (self.isMounting() || self.isUnmounting()) {
                        return reject(new SystemError("Unable to mount the container because of unexpected state [" + self.state + "]", "unableToRemount"));
                    } else {
                        debug("plugin-container:" + self.plugin.name)("Mounting...");
                        self.state = "mounting";
                        Promise
                            .each(self._beforeMount, fn => fn())
                            .then(function() {
                                self.instanceLocked = true;
                                return (new Promise(
                                    // mount plugin instance
                                    function(ok, nope) {
                                        self.instance.mount(function(err) {
                                            if (err) {
                                                return nope(err);
                                            }
                                            return ok();
                                        });
                                    }))
                                    .then(resolve)
                                    // plugin instance failed somewhere in that case for now we throw back error
                                    // so it will shutdown system (unexpected state)
                                    .catch(function(err) {
                                        self.logger.error("An exception occurred on method .mount from plugin %s:", self.plugin.name, err.message);
                                        reject(err);
                                    });
                            })
                            .catch(reject);
                    }
                });
            }))
            .then(function() {
                self.state = "mounted";
                self.emit("mounted");
                self.semaphore.leave();
                return self;
            })
            .catch(function(err) {
                if (err.code !== "unableToRemount") {
                    self.logger.error("Unexpected error while mounting plugin %s, The container will automatically unmount", self.plugin.name);
                    self.unmount()
                        .catch(err => self.emit("unexpectedErrorState", err));
                }
                self.semaphore.leave();
                throw err;
            });
    }

    public unmount() {
        let self = this;
        return (new Promise(
            function(resolve, reject) {
                self.semaphore.take(function() {
                    // State should only be null/unmounted/mounted. In case of
                    // - null -> something went wrong or component directly unmounted ok
                    // - mounting -> something went wrong when mounting (probably we need to force unmount because of error) ok
                    // - mounted -> normal demand ok
                    // - unmounted -> We just ignore it
                    // - unmounting -> Unexpected state of container -> exception
                    if (self.isUnmounted()) {
                        return resolve(self);
                    } else if (self.isUnmounting()) {
                        return reject(new SystemError("Unable to mount the container because of unexpected state [" + self.state + "]", "unableToRemount"));
                    } else {
                        debug("plugin-container:" + self.plugin.name)("Unmounting...");
                        self.state = "unmounting";
                        Promise
                            .each(self._beforeUnmount, fn => fn())
                            .then(function() {
                                return (new Promise(
                                    // mount plugin instance
                                    function(ok, nope) {
                                        self.instance.unmount(function(err) {
                                            if (err) {
                                                return nope(err);
                                            }
                                            return ok();
                                        });
                                    }))
                                    .then(resolve)
                                    .catch(function(err) {
                                        reject(err);
                                    });
                            })
                            .catch(reject);
                    }
                });
            }))
            .then(function() {
                self.state = "unmounted";
                self.instance = null; // free module
                self.emit("unmounted");
                self.semaphore.leave();
                return self;
            })
            .catch(function(err) {
                // We should not reach this state. If an error happens while unmounting this is bad
                self.logger.error("Unexpected error while unmounting plugin %s.", self.plugin.name);
                self.emit("unexpectedErrorState", err);
                self.semaphore.leave();
                throw err;
            });
    }

    protected lock(lock) {
        let self = this;
        self.semaphore.take(function() {
            lock(function() {
                self.semaphore.leave();
            });
        });
    }

    public reloadInstance() {
        if (this.instanceLocked) {
            throw new Error("Plugin instance " + this.plugin.name + " cannot be reloaded anymore");
        }
        debug("plugin-container:" + this.plugin.name)("Reload plugin instance");
        this.instance = this.getPluginInstance();
    }

    protected getPluginInstance(): PluginInstance {
        let plugin = this.plugin;
        let PluginClass = PluginInstanceDefault;
        if (plugin.package.main) {
            // get module instance path
            let pluginAbsolutePath = path.resolve(this.system.config.synchronizedPluginsPath, plugin.name);
            let modulePath = path.resolve(pluginAbsolutePath, plugin.package.main);

            debug("plugin-container:" + this.plugin.name)("plugin instance path is %s", modulePath);

            // now require the module
            decache(require.resolve(modulePath));
            PluginClass = require(modulePath);
        }

        // require the class export of plugin & create the instance
        // also in case of missing attribute we merge it with DefaultPluginInstance that contains everything needed
        let instance = new PluginClass(this.system, this.helper);
        instance.mount = typeof instance.mount === "function" ? instance.mount : ((done) => done());
        instance.unmount = typeof instance.unmount === "function" ? instance.unmount : ((done) => done());

        return instance;
    }
}
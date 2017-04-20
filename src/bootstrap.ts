import {System} from "./system";
import util = require('util');
import * as _ from "lodash";
import * as path from "path";
import {debug} from "./shared/debug";
import {HookHelper} from "./core/hook-helper";
import {SystemError} from "./core/error";
import {HookContainer} from "./core/hook-container";
import {HookConfigStorageModel} from "./core/shared-server-api/lib/models/hook-option";
import {verifyHookModule} from "./shared/hooks";

export class Bootstrap {

    system: System;

    constructor(system) {
        this.system = system;
    }

    /**
     * @param done
     */
    public bootstrap(done) {
        let self = this;
        let initializing = true;

        Promise.resolve()
            // Initialize core services
            .then(function() {
                return Promise.resolve()
                    // @todo ignore sharedApiServer when using proxy
                    .then(() => self.system.sharedApiServer.initialize())
                    .then(() => self.system.sharedApiService.initialize())
                    // For now we need the shared api server to be connected
                    .then(function() {
                        debug("system:bootstrap")("We now wait for api to be ready...");
                        let warningApi = setTimeout(function() {
                            self.system.logger.warn("The api seems to be unreachable or taking unusually long time to respond. Please " +
                                "verify that the remote api is running correctly before starting the system");
                        }, 10000);
                        return self.system.sharedApiService.apiReady()
                            .then(function() {
                                clearTimeout(warningApi);
                                return Promise.resolve();
                            });
                    })
                    .then(() => self.loadUserSystemConfig())
                    // After this point user options are available through entire app.
                    .then(() => Promise.all([
                        self.system.speaker.initialize(),
                        self.system.communicationBus.initialize(),
                        self.loadHooks(),
                    ]));
            })
            .then(function() {
                initializing = false;
                return done();
            })
            .catch(function(err) {
                initializing = false;
                return done(err);
            });

        // Warning for abnormal time
        setTimeout(function() {
            if (initializing) {
                self.system.logger.warn("The initialization process is still not done and seems to take an unusual long time. For some cases you may increase the time in config file.");
            }
        }, 10000);
    }

    /**
     * Load the user system config.
     * That config is dynamic and loaded during startup (different from static)
     */
    protected loadUserSystemConfig() {
        let self = this;
        return this.system.sharedApiService.getSystemConfig()
            .then(function(config) {
                debug("system:bootstrap")("User config retrieved");
                self.system.config.userConfig = config;
            });
    }

    /**
     * @private
     */
    protected loadHooks() {
        let self = this;
        let promises = [];
        _.forEach(self.system.config.hooks, function(config, name) {
            debug("system:bootstrap:hooks")("Check hook config for %s", name);

            // normalize config
            if (typeof config === "boolean") {
                config = { activated: config };
            }
            // set default hook user config
            config.config = config.config || {};
            let modulePath = config.modulePath || "./hooks/" + name;

            // hook is deactivated
            if (config.activated === false) {
                debug("system:bootstrap:hooks")("Hook %s is deactivated", name);
                return promises.push(Promise.resolve());
            }

            let hookModule = null;
            let hookType = "user";
            // If the module path is specified we use it as priority
            if (_.isString(config.modulePath)) {
                let modulePath = path.resolve(config.modulePath);
                debug("system:bootstrap:hooks")("Trying to load Hook %s from path %s", name, modulePath);
                hookModule = require(modulePath);
            } else {
                // then we try to lookup core module. We always use core hooks as priority over node_modules
                debug("system:bootstrap:hooks")("Trying to load Hook %s as core module at %s", name, modulePath);
                try {
                    hookModule = require(modulePath);
                    hookType = "core";
                } catch(err) {
                    // @WARING DEV: MODULE_NOT_FOUND may appears on core module if one of its dependency is not installed (and will throw false error)
                    if (err.code !== "MODULE_NOT_FOUND") { throw err; }
                    modulePath = path.resolve(self.system.config.appPath, "node_modules", name);
                    // if core hook does not exist we try to load node_module  hook
                    debug("system:bootstrap:hooks")("The hook %s does not seems to be a core module so we try to load as node dependency with require(\"%s\")", name, modulePath);
                    try { hookModule = require(modulePath); } catch(err) {
                        if (err.code !== "MODULE_NOT_FOUND") {
                            throw err;
                        } else {
                            // Hook module not found
                            throw new SystemError("The hook " + name + " does not seems to exist. Please check that you have installed the module as a dependency. Error: " + err.message, undefined, err);
                        }
                    }
                }
            }

            // we pass the user config to the hook so it can override its own config
            hookModule.prototype.initialize = hookModule.prototype.initialize || (() => Promise.resolve());
            hookModule.prototype.shutdown = hookModule.prototype.shutdown || (() => Promise.resolve());

            promises.push(
                self.system.sharedApiService
                    .apiReady()
                    .then(() => self.system.sharedApiService.getHookConfigData(name))
                    .then(function(userOptions) {
                        if (!userOptions) {
                            userOptions = {};
                        }
                        let hook = new hookModule(self.system, self.system.config.hooks[name].config, new HookHelper(self.system, name), userOptions);
                        self.system.registerTaskOnShutdown((cb) => {
                            hook.shutdown()
                                .then(() => cb())
                                .catch(cb);
                        });
                        // export hook info
                        let packageInfo = { name, version: self.system.info.version };
                        if (hookType === "user") {
                            packageInfo = require(modulePath + "/package.json");
                        }
                        self.system.hooks[name] = new HookContainer(hook, {
                            ...packageInfo,
                            type: hookType
                        });
                        return hook.initialize().then(() => hook);
                    })
                    .then(function(hook) {
                        debug("system:bootstrap:hooks")("Hook %s initialized", name);
                        // next tick so hooks may use system.on("...:initialized") inside the initialize() method.
                        setImmediate(function() {
                            self.system.emit("hook:" + name + ":initialized", hook);
                        });
                    })
            );

        });

        return Promise.all(promises)
            // listeners for config change
            .then(function() {
                let onHooksConfigUpdate = function(config: HookConfigStorageModel) {
                    self.system.emit("hook:" + config.hookName + ":options:updated", config.data);
                };
                self.system.sharedApiService.io.on("hooks-config:created", onHooksConfigUpdate);
                self.system.sharedApiService.io.on("hooks-config:updated", onHooksConfigUpdate);
                self.system.registerTaskOnShutdown((cb) => {
                    self.system.sharedApiService.io.removeListener("hooks-config:created", onHooksConfigUpdate);
                    self.system.sharedApiService.io.removeListener("hooks-config:updated", onHooksConfigUpdate);
                    return cb();
                });
            });
    }
}

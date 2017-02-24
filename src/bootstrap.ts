import {System} from "./system";
import util = require('util');
import * as _ from "lodash";
import {debug} from "./shared/debug";
import {HookHelper} from "./core/hook-helper";

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
                return Promise.all([
                    self.system.speaker.initialize(),
                    self.system.communicationBus.initialize(),
                    self.system.sharedApiService.initialize(),
                    self.system.storage.initialize(),
                    self.loadHooks(),
                ]);
            })
            // For now we need the shared api server to be connected
            .then(function() {
                return self.system.sharedApiService.get("/ping")
                    .then(function() {
                        return Promise.resolve();
                    })
                    .catch(function() {
                        self.system.logger.warn("Please check that the remote server is running before starting the system");
                        throw new Error("Waiting for remote api server starting");
                    });
            })
            // @todo register system on shared api
            // .then(function() {
            //
            // })
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
     * @private
     */
    protected loadHooks() {
        let self = this;
        let promises = [];
        _.forEach(self.system.config.hooks, function(config, name) {
            debug("hooks")("Check hook config for %s", name);

            // normalize config
            if (typeof config === "boolean") {
                config = { activated: config };
            }
            // set default hook user config
            config.config = config.config || {};
            let modulePath = config.modulePath || "./hooks/" + name;

            // hook is deactivated
            if (config.activated === false) {
                debug("hooks")("Hook %s is deactivated", name);
                return promises.push(Promise.resolve());
            }

            // first we try to lookup core module. We always use core hooks as priority
            let hookModule = null;
            if (_.isString(config.modulePath)) {
                debug("hooks")("Trying to load Hook %s from path %s", name, config.module);
                hookModule = require(modulePath);
            } else {
                debug("hooks")("Trying to load Hook %s as core module at %s", name, modulePath);
                try { hookModule = require(modulePath); } catch(err) {
                    // @WARING DEV: MODULE_NOT_FOUND may appears on core module if one of its dependency is not installed (and will throw false error)
                    if (err.code !== "MODULE_NOT_FOUND") { throw err; };
                    // if core hook does not exist we try to load node_module  hook
                    debug("hooks")("The hook %s does not seems to be a core module so we try to load as node dependency", name);
                    try { hookModule = require(name); } catch(err) {
                        if (err.code !== "MODULE_NOT_FOUND") {
                            throw err;
                        } else {
                            // Hook module not found
                            throw new Error("The hook " + name + " does not seems to exist. Please check that you have installed the module as a dependency. Error: " + err);
                        }
                    }
                }
            }

            // All hook events are dispatched through system
            // monkey-patch hard way. The easy way is to store original method in var and call it after. But I like playing hard >_<
            // hookModule.prototype.emit = function() {
            //     let res;
            //     if (this instanceof require("events").EventEmitter) {
            //         res = this.constructor.EventEmitter.prototype.emit.apply(this, arguments);
            //         arguments[0] = "hooks:" + name + ":" + arguments[0];
            //         self.system.emit.apply(self.system, arguments);
            //     }
            //     return res;
            // };

            // we pass the user config to the hook so it can override its own config
            // let hook = _.merge(hookBoilerplate, new hookModule(self.system, self.system.config.hooks[name].config, new HookHelper(self.system, name)));
            let hook = new hookModule(self.system, self.system.config.hooks[name].config, new HookHelper(self.system, name));
            self.system.registerTaskOnShutdown((cb) => {
                hook.onShutdown()
                    .then(() => {cb()})
                    .catch(cb);
            });
            self.system.hooks[name] = hook;
            promises.push(
                hook.initialize()
                    .then(function() {
                        debug("hooks")("Hook %s initialized", name);
                        setImmediate(function() {
                            self.system.emit("hook:" + name + ":initialized");
                        });
                    })
            );
        });

        return Promise.all(promises);
    }
}

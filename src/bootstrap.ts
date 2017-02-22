import {System} from "./system";
import util = require('util');
import * as _ from "lodash";
import {debug} from "./shared/debug";
import * as Bluebird from "bluebird";
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
            config.modulePath = config.modulePath || "./hooks/" + name;

            // hook is deactivated
            if (config.activated === false) {
                debug("hooks")("Hook %s is deactivated", name);
                return promises.push(Promise.resolve());
            }

            // first we try to lookup core module. We always use core hooks as priority
            let hookModule = null;
            debug("hooks")("Trying to load Hook %s as core module at %s", name, config.modulePath);
            try { hookModule = require(config.modulePath); } catch(err) {
                if (err.code !== "MODULE_NOT_FOUND") { throw err; };
                // if core hook does not exist we try to load node_module  hook
                debug("hooks")("Trying to load Hook %s as simple module dependency", name);
                try { hookModule = require(name); } catch(err) {
                    if (err.code !== "MODULE_NOT_FOUND") { throw err; };
                }
            }

            // Hook module not found
            if (!hookModule) {
                return promises.push(Promise.reject(new Error("The hook " + name + " does not seems to exist. Please check that you have installed the module in your dependencies.")));
            }

            // monkey-patch hard way. The easy way is to store original method in var and call it after. But I like playing hard >_<
            hookModule.prototype.emit = function() {
                let res;
                if (this instanceof require("events").EventEmitter) {
                    res = this.constructor.EventEmitter.prototype.emit.apply(this, arguments);
                    arguments[0] = "hooks:" + name + ":" + arguments[0];
                    self.system.emit.apply(self.system, arguments);
                }
                return res;
            };

            // we pass the user config to the hook so it can override its own config
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

'use strict';

import {System} from "./system";
import {hookMixin} from "./core/hook-interface";
let util = require('util');
let self = this;
let _ = require("lodash");

export class Bootstrap {

    system: System;
    logger: any;

    constructor(system) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('Bootstrap');
    }

    /**
     *
     * @param done
     */
    bootstrap(done) {
        let self = this;
        let initializing = true;
        let hooksToLoad = [];

        // register hooks (for now only core)
        hooksToLoad.push("client-web-server");
        hooksToLoad.push("shared-server-api");
        hooksToLoad.push("scenarios");
        hooksToLoad.push("plugins");

        Promise.resolve()
            // Initialize core services
            .then(function() {
                return Promise.all([
                    self.system.speaker.initialize(),
                    self.system.communicationBus.initialize(),
                    self.system.sharedApiService.initialize(),
                    self.system.storage.initialize(),
                    self._loadHooks(hooksToLoad),
                ]);
            })
            // For now we need the shared api server to be connected
            .then(function() {
                return self.system.sharedApiService.get("/ping")
                    .then(function() {
                        return Promise.resolve();
                    })
                    .catch(function() {
                        self.logger.warn("Please check that the remote server is running before starting the system");
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
                self.logger.warn("The initialization process is still not done and seems to take an unusual long time. For some cases you may increase the time in config file.");
            }
        }, 10000);
    }

    /**
     * @returns {Object}
     * @private
     */
    _loadHooks(hooksToLoad) {
        let self = this;
        let promises = [];
        hooksToLoad.forEach(function(moduleName) {
            self.logger.verbose("Initializing hook %s..", moduleName);
            let Module = require("./hooks/" + moduleName);

            // monkey-patch hard way. The easy way is to store original method in var and call it after. But I like playing hard >_<
            Module.prototype.emit = function() {
                if (this instanceof require("events").EventEmitter) {
                    this.constructor.EventEmitter.prototype.emit.apply(this, arguments);
                    arguments[0] = "hooks:" + moduleName + ":" + arguments[0];
                    self.system.emit.apply(self.system, arguments);
                }
            };

            let hook = new Module(self.system, self.system.config.hooks[moduleName]);
            promises.push(
                hook.initialize()
                    .then(function() {
                        self.logger.verbose("Hook %s initialized", moduleName);
                        setImmediate(function() {
                            self.system.emit("hook:" + moduleName + ":initialized");
                        });
                    })
            );
        });

        return Promise.all(promises);
    }
}

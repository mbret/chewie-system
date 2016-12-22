'use strict';
import {System} from "./system";
let util = require('util');
let self = this;

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
        hooksToLoad.push("runtime-profile");
        hooksToLoad.push("client-web-server");

        Promise
            .all([
                self.system.speaker.initialize(),
                self.system.communicationBus.initialize(),
                self.system.sharedApiServer.initialize(),
                self.system.storage.initialize(),
                self._loadHooks(hooksToLoad),
            ])
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
        }, 6000);
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
            let hook = new Module(self.system);
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

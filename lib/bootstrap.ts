'use strict';
import {Daemon} from "./daemon";
let async = require('async');
let util = require('util');
let path = require('path');
let self = this;

export class Bootstrap {

    system: Daemon;
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

        // register hooks (for now only core)
        this.system.hooksToLoad.push("runtime-profile");
        this.system.hooksToLoad.push("client-web-server");

        Promise
            .all([
                self.system.speaker.initialize(),
                self.system.communicationBus.initialize(),
                self.system.sharedApiServer.initialize(),
                self.system.storage.initialize(),
                self._loadHooks(),
            ])
            .then(done.bind(self, null))
            .catch(done);
    }

    /**
     * @returns {Object}
     * @private
     */
    _loadHooks() {
        let self = this;
        let promises = [];
        this.system.hooksToLoad.forEach(function(moduleName) {
            let Module = require("./hooks/" + moduleName);
            let hook = new Module(self.system);
            promises.push(new Promise(function(resolve, reject) {
                hook.initialize(function(err) {
                    if (err) {
                        return reject(err);
                    }
                    self.logger.debug("Hook %s initialized", moduleName);
                    setImmediate(function() {
                        self.system.emit("hook:" + moduleName + ":initialized");
                    });
                    return resolve();
                });
            }));
        });

        return Promise.all(promises);
    }
}

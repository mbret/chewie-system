'use strict';
let util = require('util');
let self = this;
let _ = require("lodash");
class Bootstrap {
    constructor(system) {
        self = this;
        this.system = system;
        this.logger = system.logger.getLogger('Bootstrap');
    }
    bootstrap(done) {
        let self = this;
        let initializing = true;
        let hooksToLoad = [];
        hooksToLoad.push("client-web-server");
        hooksToLoad.push("shared-server-api");
        hooksToLoad.push("scenarios");
        hooksToLoad.push("plugins");
        Promise.resolve()
            .then(function () {
            return Promise.all([
                self.system.speaker.initialize(),
                self.system.communicationBus.initialize(),
                self.system.sharedApiService.initialize(),
                self.system.storage.initialize(),
                self._loadHooks(hooksToLoad),
            ]);
        })
            .then(function () {
            return self.system.sharedApiService.get("/ping")
                .then(function () {
                return Promise.resolve();
            })
                .catch(function () {
                self.logger.warn("Please check that the remote server is running before starting the system");
                throw new Error("Waiting for remote api server starting");
            });
        })
            .then(function () {
            initializing = false;
            return done();
        })
            .catch(function (err) {
            initializing = false;
            return done(err);
        });
        setTimeout(function () {
            if (initializing) {
                self.logger.warn("The initialization process is still not done and seems to take an unusual long time. For some cases you may increase the time in config file.");
            }
        }, 10000);
    }
    _loadHooks(hooksToLoad) {
        let self = this;
        let promises = [];
        hooksToLoad.forEach(function (moduleName) {
            self.logger.verbose("Initializing hook %s..", moduleName);
            let Module = require("./hooks/" + moduleName);
            Module.prototype.emit = function () {
                if (this instanceof require("events").EventEmitter) {
                    this.constructor.EventEmitter.prototype.emit.apply(this, arguments);
                    arguments[0] = "hooks:" + moduleName + ":" + arguments[0];
                    self.system.emit.apply(self.system, arguments);
                }
            };
            let hook = new Module(self.system, self.system.config.hooks[moduleName]);
            self.system.hooks[moduleName] = hook;
            promises.push(hook.initialize()
                .then(function () {
                self.logger.verbose("Hook %s initialized", moduleName);
                setImmediate(function () {
                    self.system.emit("hook:" + moduleName + ":initialized");
                });
            }));
        });
        return Promise.all(promises);
    }
}
exports.Bootstrap = Bootstrap;
//# sourceMappingURL=bootstrap.js.map
'use strict';
let util = require('util');
let self = this;
class Bootstrap {
    constructor(system) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('Bootstrap');
    }
    bootstrap(done) {
        let self = this;
        let initializing = true;
        let hooksToLoad = [];
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
        }, 6000);
    }
    _loadHooks(hooksToLoad) {
        let self = this;
        let promises = [];
        hooksToLoad.forEach(function (moduleName) {
            self.logger.verbose("Initializing hook %s..", moduleName);
            let Module = require("./hooks/" + moduleName);
            let hook = new Module(self.system);
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

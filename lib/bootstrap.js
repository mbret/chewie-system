'use strict';
var async = require('async');
var util = require('util');
var path = require('path');
var self = this;
var Bootstrap = (function () {
    function Bootstrap(system) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('Bootstrap');
    }
    Bootstrap.prototype.bootstrap = function (done) {
        var self = this;
        this.system.hooksToLoad.push("runtime-profile");
        this.system.hooksToLoad.push("client-web-server");
        Promise
            .all([
            self.system.speaker.initialize(),
            self.system.communicationBus.initialize(),
            self.system.sharedApiServer.initialize(),
            self._loadStorage(),
            self._loadHooks(),
        ])
            .then(done.bind(self, null))
            .catch(done);
    };
    Bootstrap.prototype._loadHooks = function () {
        var self = this;
        var promises = [];
        this.system.hooksToLoad.forEach(function (moduleName) {
            var Module = require("./hooks/" + moduleName);
            var hook = new Module(self.system);
            promises.push(new Promise(function (resolve, reject) {
                hook.initialize(function (err) {
                    if (err) {
                        return reject(err);
                    }
                    self.logger.debug("Hook %s initialized", moduleName);
                    setImmediate(function () {
                        self.system.emit("hook:" + moduleName + ":initialized");
                    });
                    return resolve();
                });
            }));
        });
        return Promise.all(promises);
    };
    Bootstrap.prototype._loadStorage = function () {
        return this.system.storage.initialize()
            .then(function () {
            self.logger.debug("Storage initialized");
        });
    };
    Bootstrap.prototype._oldBootstrap = function () {
        var system = this.system;
        return new Promise(function (resolve, reject) {
            async.series([
                function (done) {
                    async.parallel([
                        function (cb) {
                            return cb();
                        },
                        function (cb) {
                            return cb();
                        },
                    ], done);
                },
            ], function (err) {
                if (err) {
                    return reject(err);
                }
                self.logger.debug("Old bootstrap initialized");
                return resolve();
            });
        });
    };
    return Bootstrap;
}());
exports.Bootstrap = Bootstrap;

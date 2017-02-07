'use strict';
var _ = require('lodash');
var async = require('async');
class OutputAdaptersHandler {
    constructor(system) {
        this.logger = system.logger.getLogger('OutputAdaptersHandler');
        this.system = system;
        this.adapters = {};
    }
    getAdapters() {
        return this.adapters;
    }
    getAdapter(id) {
        if (this.adapters[id]) {
            return this.adapters[id];
        }
        return null;
    }
    initializeModules(cb) {
        var self = this;
        async.forEachOf(this.getAdapters(), function (adapter, name, done) {
            self.logger.debug('Initialize adapter [%s]', name);
            var initialized = false;
            adapter.instance.initialize(function (err) {
                initialized = true;
                if (err) {
                    self.logger.error('Error while starting adapter [%s]', name);
                    return done(err);
                }
                return done();
            });
            setTimeout(function () {
                if (!initialized) {
                    self.logger.warn('The message adapter [%s] seems to take abnormal long time to start!', name);
                }
            }, 1500);
        }, function (err) {
            cb(err);
        });
    }
}
module.exports = OutputAdaptersHandler;
//# sourceMappingURL=output-adapters-handler.js.map
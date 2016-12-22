'use strict';
var _ = require('lodash');
var async = require('async');
class OutputAdaptersHandler {
    constructor(system) {
        this.logger = system.logger.Logger.getLogger('OutputAdaptersHandler');
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
    executeMessage(outputAdapters, message) {
        var self = this;
        _.forEach(outputAdapters, function (id) {
            var adapter = MyBuddy.outputAdaptersHandler.getAdapter(id);
            if (adapter === null) {
                var mess = 'The message adapter ' + outputAdapters + ' does not seems to be loaded. Unable to execute message';
                self.logger.warn(mess);
                self.system.notificationService.push('warning', mess);
                return;
            }
            adapter.executeMessage(message);
        });
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

"use strict";
const events_1 = require("events");
const error_1 = require("./error");
var taskQueue = require('my-buddy-lib').taskQueue;
var _ = require('lodash');
class ProfileManager extends events_1.EventEmitter {
    constructor(system) {
        super();
        this.logger = system.logger.Logger.getLogger('ProfileManager');
        this.system = system;
        this.profile = null;
        this.lock = false;
    }
    startProfile(username) {
        let self = this;
        return Promise.resolve()
            .then(function () {
            return self.system.apiService
                .findUserByUsername(username)
                .then(function (user) {
                if (!user) {
                    throw new error_1.SystemError('No user found with username ' + username, error_1.SystemError.CODE_PREFIX + "1");
                }
                self.logger.debug('Profile %s starting', username);
                if (self.lock) {
                    self.logger.warn('Trying to start a profile but system is still lock');
                    return Promise.reject(new Error('Not available yet to start'));
                }
                self.profile = user;
                self.lock = true;
                self.system.emit("profile:start", self.profile);
                return new Promise(function (resolve, reject) {
                    taskQueue.proceed('profile:start', null, function (errs) {
                        if (errs) {
                            let txt = 'Unable to start profile. One or more errors has been thrown on starting task processing. Below are the errors:';
                            _.forEach(errs.errors, function (err, index) {
                                txt += "\n[Error " + ++index + "]";
                                txt += "\n" + err.stack;
                            });
                            return reject(new Error(txt));
                        }
                        setTimeout(function () {
                            self.lock = false;
                            self.system.emit('profile:start:complete');
                            self.logger.debug('Profile %s started', username);
                            return resolve();
                        }, 1);
                    });
                });
            });
        })
            .catch(function (err) {
            throw new error_1.SystemError("Error while starting profile " + username + "\n" + err.stack, err.code);
        });
    }
    stopProfile() {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (self.lock) {
                self.logger.warn('Trying to stop a profile but system is still lock');
                return reject(new Error('Not available yet to stop'));
            }
            self.logger.debug('Profile %s stopping..', self.profile.username);
            self.emit('profile:stop');
            self.lock = true;
            taskQueue.proceed('profile:stop', null, function () {
                setTimeout(function () {
                    self.lock = false;
                    self.emit('profile:stopped:completed');
                    self.logger.info('Profile %s stopped', self.profile.id);
                    self.profile = null;
                    return resolve();
                }, 2000);
            });
        });
    }
    getActiveProfile() {
        return this.profile;
    }
    getActiveProfileId() {
        return this.profile.id;
    }
    setActiveProfile(profile) {
        this.profile = profile;
        return this;
    }
    hasActiveProfile() {
        return this.getActiveProfile() !== null;
    }
}
exports.ProfileManager = ProfileManager;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("events");
var error_1 = require("./error");
var taskQueue = require('my-buddy-lib').taskQueue;
var _ = require('lodash');
var ProfileManager = (function (_super) {
    __extends(ProfileManager, _super);
    function ProfileManager(system) {
        var _this = _super.call(this) || this;
        _this.logger = system.logger.Logger.getLogger('ProfileManager');
        _this.system = system;
        // Represent the current active profile
        // contain an user db object as json
        _this.profile = null;
        // Lock ensure that when profile is started / stopped, all the task are processed before
        // a new attempt to start / stop. It avoid undefined state problem.
        _this.lock = false;
        return _this;
    }
    /**
     * Start a profile.
     *
     * @param username
     * @returns Promise.<Instance>
     */
    ProfileManager.prototype.startProfile = function (username) {
        var self = this;
        return Promise.resolve()
            .then(function () {
            // get profile id
            return self.system.apiService
                .findUserByUsername(username)
                .then(function (user) {
                // no user found with this username
                if (!user) {
                    throw new error_1.SystemError('No user found with username ' + username, error_1.SystemError.CODE_PREFIX + "1");
                }
                self.logger.debug('Profile %s starting', username);
                if (self.lock) {
                    self.logger.warn('Trying to start a profile but system is still lock');
                    return Promise.reject(new Error('Not available yet to start'));
                }
                // load user
                self.profile = user;
                // async
                // Profile start may take some times, during this time we should not allow profile to stop.
                self.lock = true;
                self.system.emit("profile:start", self.profile);
                return new Promise(function (resolve, reject) {
                    taskQueue.proceed('profile:start', null, function (errs) {
                        if (errs) {
                            var txt_1 = 'Unable to start profile. One or more errors has been thrown on starting task processing. Below are the errors:';
                            _.forEach(errs.errors, function (err, index) {
                                txt_1 += "\n[Error " + ++index + "]";
                                txt_1 += "\n" + err.stack;
                            });
                            return reject(new Error(txt_1));
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
    };
    /**
     * Stop the current profile.
     *
     * @returns Promise.<Instance>
     */
    ProfileManager.prototype.stopProfile = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (self.lock) {
                self.logger.warn('Trying to stop a profile but system is still lock');
                return reject(new Error('Not available yet to stop'));
            }
            self.logger.debug('Profile %s stopping..', self.profile.username);
            self.emit('profile:stop');
            // async
            // when profile is stopped the system need to do some stuff. This
            // is important and no profile be started in during this time. For example running new user task
            // while the old user tasks may have not been canceled result in unexpected state. Any services that allow
            // profile to start should listen for event profile:stopped:tasks:complete and allow login after that.
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
    };
    ProfileManager.prototype.getActiveProfile = function () {
        return this.profile;
    };
    ProfileManager.prototype.getActiveProfileId = function () {
        return this.profile.id;
    };
    ProfileManager.prototype.setActiveProfile = function (profile) {
        this.profile = profile;
        return this;
    };
    ProfileManager.prototype.hasActiveProfile = function () {
        return this.getActiveProfile() !== null;
    };
    return ProfileManager;
}(events_1.EventEmitter));
exports.ProfileManager = ProfileManager;

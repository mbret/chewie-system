'use strict';

var CustomEventEmitter = require(CORE_DIR + '/custom-event-emitter');
var taskQueue = require('my-buddy-lib').taskQueue;
var _ = require('lodash');

class ProfileManager extends CustomEventEmitter {

    constructor(system){
        super();

        this.logger = system.logger.Logger.getLogger('ProfileManager');

        this.system = system;

        // Represent the current active profile
        // contain an user db object as json
        this.profile = null;

        // Lock ensure that when profile is started / stopped, all the task are processed before
        // a new attempt to start / stop. It avoid undefined state problem.
        this.lock = false;

        // this.startTasks = [];
    }

    /**
     * Start a profile.
     *
     * Proceed the task queue under 'profile:start'.
     *
     * @param username
     * @returns Promise.<Instance>
     */
    startProfile(username){
        var self = this;

        return (new Promise(function(resolve, reject){

            // get profile id
            return self.system.apiService.findUserByUsername(username)
                .then(function(user){

                    // no user found with this username
                    if(!user){
                        return reject(new Error('No user found with username ' + username));
                    }

                    self.logger.debug('Profile %s starting', username);

                    if(self.lock){
                        self.logger.warn('Trying to start a profile but system is still lock');
                        return reject(new Error('Not available yet to start'));
                    }

                    // load user
                    self.profile = user;

                    // async
                    // Profile start may take some times, during this time we should not allow profile to stop.
                    self.lock = true;
                    self.emit("profile:start", self.profile);
                    taskQueue.proceed('profile:start', null, function(errs){
                        if(errs){
                            var txt = 'Unable to start profile. One or more errors has been thrown on starting task processing. Below are the errors:';
                            _.forEach(errs.errors, function(err, index) {
                                txt += "\n[Error " + ++index + "]";
                                txt += "\n" + err.stack;
                            });
                            return reject(new Error(txt));
                        }
                        setTimeout(function(){
                            self.lock = false;
                            self.emit('profile:start:complete');
                            self.logger.debug('Profile %s started', username);
                            return resolve();
                        }, 1);
                    });
                })
                .catch(function(err){
                    return reject(err);
                });

        }))
        .catch(function(err){
            return Promise.reject(new Error("Error while starting profile " + username + "\n" + err.stack));
        });

    }

    /**
     * Stop the current profile.
     *
     * @returns Promise.<Instance>
     */
    stopProfile(){

        var self = this;

        return new Promise(function(resolve, reject){

            if(self.lock){
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
            taskQueue.proceed('profile:stop', null, function(){
                setTimeout(function(){
                    self.lock = false;
                    self.emit('profile:stopped:completed');
                    self.logger.info('Profile %s stopped', self.profile.id);
                    self.profile = null;
                    return resolve();
                }, 2000);
            });
        });
    }

    getActiveProfile(){
        return this.profile;
    }

    getActiveProfileId(){
        return this.profile.id;
    }

    setActiveProfile(profile){
        this.profile = profile;
        return this;
    }

    hasActiveProfile(){
        return this.getActiveProfile() !== null;
    }
}

module.exports = ProfileManager;
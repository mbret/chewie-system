'use strict';

var CustomEventEmitter = require(CORE_DIR + '/custom-event-emitter');
var taskQueue = require('my-buddy-lib').taskQueue;
var logger = LOGGER.getLogger('ProfileManager');
var _ = require('lodash');

class ProfileManager extends CustomEventEmitter{

    constructor(system){
        super();
        this.system = system;

        // Represent the current active profile
        // contain an user db object as json
        this.profile = null;

        // Lock ensure that when profile is started / stopped, all the task are processed before
        // a new attempt to start / stop. It avoid undefined state problem.
        this.lock = false;
    }

    /**
     * Start a profile.
     *
     * Proceed the task queue under 'profile:start'.
     *
     * @param userId
     * @returns Promise.<Instance>
     */
    startProfile(userId){
        var self = this;

        return (new Promise(function(resolve, reject){

            if(!userId){
                Promise.reject(new Error('Invalid user id'));
            }

            logger.debug('Profile %s starting', userId);

            if(self.lock){
                logger.warn('Trying to start a profile but system is still lock');
                return reject(new Error('Not available yet to start'));
            }

            return self.system.orm.models.User.findOne({where: {id: userId}})
                .then(function(user){
                    if(!user){
                        return reject(new Error('No user found with id ' + userId));
                    }

                    // load user
                    self.profile = user.toJSON();

                    // async
                    // Profile start may take some times, during this time we should not allow profile to stop.
                    self.lock = true;
                    taskQueue.proceed('profile:start', null, function(errs){
                        if(errs){
                            var txt = 'Unable to start profile. Error on starting task processing.';
                            _.forEach(errs, logger.error);
                            return reject(new Error(txt));
                        }
                        setTimeout(function(){
                            self.lock = false;
                            self.emit('profile:start:complete');
                            logger.info('Profile %s started', userId);
                            return resolve();
                        }, 1);
                    });
                })
                .catch(function(err){
                    return reject(err);
                });
        }))
            .catch(function(err){
                logger.error('Error while starting profile %s', userId);
                return Promise.reject(err);
            });

    }

    /**
     * Stop the current profile.
     *
     * Proceed the task queue under 'profile:stopped'.
     *
     * @returns Promise.<Instance>
     */
    stopProfile(){

        var self = this;

        return new Promise(function(resolve, reject){

            if(self.lock){
                logger.warn('Trying to start a profile but system is still lock');
                return reject(new Error('Not available yet to stop'));
            }

            // async
            // when profile is stopped the system need to do some stuff. This
            // is important and no profile be started in during this time. For example running new user task
            // while the old user tasks may have not been canceled result in unexpected state. Any services that allow
            // profile to start should listen for event profile:stopped:tasks:complete and allow login after that.
            self.lock = true;
            taskQueue.proceed('profile:stopped', null, function(){
                setTimeout(function(){
                    self.lock = false;
                    self.emit('profile:stopped:completed');
                    logger.info('Profile %s stopped', self.profile.id);
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

    hasActiveProfile(){
        return this.getActiveProfile() !== null;
    }
}

module.exports = ProfileManager;
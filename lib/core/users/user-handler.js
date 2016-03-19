'use strict';

var User = require('./user');
var CustomEventEmitter = require(CORE_DIR + '/custom-event-emitter');
var taskQueue = require('my-buddy-lib').taskQueue;

class UserHandler extends CustomEventEmitter{

    constructor(system){
        super();
        var self = this;
        this.system = system;

        // Represent the current active profile
        // contain an user object
        this.profile = null;

        // Lock ensure that when profile is started / stopped, all the task are processed before
        // a new attempt to start / stop. It avoid undefined state problem.
        this.lock = false;
    }

    startProfile(userId, done){

        var self = this;

        if(this.lock){
            return done(new Error('Not available yet to start'));
        }

        // load user
        this.system.database.getAdapter('users').fetchOne(userId)
            .then(function(data){
                self.profile = new User(self.system, data);

                // async
                // Profile start may take some times, during this time we should not allow profile to stop.
                self.lock = true;
                taskQueue.proceed('profile:started', null, function(){
                    setTimeout(function(){
                        self.lock = false;
                        self.emit('profile:started:completed');
                    }, 2000);
                });

                return done(null, self.user);
            })
            .catch(function(err){
                return done(err);
            });
    }

    stopProfile(done){

        var self = this;

        if(this.lock){
            return done(new Error('Not available yet to stop'));
        }

        this.profile = null;

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
            }, 2000);
        });

        return done();
    }

    getProfile(){
        return this.profile;
    }

    hasActiveProfile(){
        return this.getProfile() !== null;
    }
}

module.exports = UserHandler;
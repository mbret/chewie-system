'use strict';

var logger = LOGGER.getLogger('UserAuthentication');
var CustomEventEmitter = require(CORE_DIR + '/custom-event-emitter');
var User = require('./user');

class UserAuthentication extends CustomEventEmitter {

    constructor(system){
        super();
        this.system = system;
        this.user = null;
    }

    getUser(){
        return this.user;
    }

    isAuthenticated(){
        return this.user !== null;
    }

    login(login, password, cb){
        var self = this;

        if(this.isAuthenticated()){
            logger.verbose('Try to login an user that is already logged, log out first!');
            return cb();
        }

        /*
         * Initialize user.
         * Create object and init + load from db.
         */
        this._initializeUser(function(err){
            if(err){
                logger.error("Unable to load user");
                logger.error(err);
                return cb(err);
            }

            logger.info('[%s] has been logged in', login);
            self.emit('logged:in');
            return cb();
        });
    }

    logout(cb){
        this.emit('logged:out');
        if(!this.isAuthenticated()){
            return cb();
        }

        logger.info('[%s] has been logged out', this.user.login);
        this.user = null;
        this.emit('logged:out');
        return cb();
    }

    _initializeUser(done){
        var self = this;

        // load user or create if first launch
        MyBuddy.database.getAdapter('users').loadOrCreate(function(err, data){
            if(err) return done(err);

            self.user = new User(self.system, data);

            return done();
        });
    }
}

module.exports = UserAuthentication;
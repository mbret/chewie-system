'use strict';

var logger = LOGGER.getLogger('User');

class User {

    constructor(system){
        this.system = system;

        this.id = null;
        this.login = null;
        this.password = null;
        this.profil = {
            firstName: null,
            lastName: null,
            birthdate: null,
        };
        this.email = null;
        this.config = null;

        // Where all credentials info are stored
        // for example buddy / google / fb
        this.credentials = null;
    }

    initialize(done){
        var self = this;

        // load user or create if first launch
        MyBuddy.database.getAdapter('users').loadOrCreate(function(err, data){
            if(err) return done(err);

            self.populate(data);

            return done();
        });
    }

    /**
     * Populate from db.
     * @param data
     */
    populate(data){
        if(data._id || data.id){
            this.id = data._id || data.id;
        }

        this.login = data.login;
        this.email = data.email;
        this.profil.firstName = data.profil.firstName;
        this.profil.lastName = data.profil.lastName;
        this.profil.birthdate = data.profil.birthdate;
        this.credentials = data.credentials;
        this.config = data.config;
    }

    getCredentials(){
        return this.credentials;
    }

    getConfig(){
        return this.config;
    }

    /**
     * Save user state to db
     */
    save(cb){
        if(!cb){
            cb = function(){};
        }
        MyBuddy.database.getAdapter('users').save(this.id, this.toDb(), cb);
    }

    toDb(){
        var json = this.toJSON();

        delete json.id;

        return json;
    }

    toJSON(){
        return {
            id: this.id,
            config: this.config,
            credentials: this.credentials
        }
    }

    getId(){
        return this.id;
    }

    logIn(login, password, cb){
        var self = this;

        /*
         * Initialize user.
         * Create object and init + load from db.
         */
        this.initialize(function(err){
            if(err){
                logger.error("Unable to load user");
                logger.error(err);
                return cb(err);
            }
            setTimeout(function(){
                logger.info('[%s] has been logged in', login);
                self.system.emit('user:logged:in');
            }, 3000);
            return cb();
        });
    }
}

module.exports = User;
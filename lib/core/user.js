'use strict';

class User{

    constructor(){
        this.id = null;

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

        if(data.credentials){
            this.credentials = data.credentials;
        }

        if(data.config){
            this.config = data.config;
        }
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
}

module.exports = User;
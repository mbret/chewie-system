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
        MyBuddy.database.users.loadOrCreate(function(err, data){
            if(err) return done(err);

            self.populate(data);

            // load user config
            MyBuddy.database.users.loadConfigOrCreate(function(err, data){
                if(err) return done(err);

                self.setConfig(data);

                return done();
            });
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
    }

    getCredentials(){
        return this.credentials;
    }

    getConfig(){
        return this.config;
    }

    setConfig(config){
        this.config = config;
    }

    /**
     * Save user state to db
     */
    save(cb){
        if(!cb){
            cb = function(){};
        }
        MyBuddy.database.users.save(this.toDb(), cb);
    }

    toDb(){
        var json = this.toJSON();

        json._id = json.id;
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
}

module.exports = User;
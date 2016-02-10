'use strict';

class User{

    constructor(){
        this.id = null;

        // Config the user set through the application
        // it's merged with
        this.config = null;

        // Where all credentials info are stored
        // for example buddy / google / fb
        this.credentials = null;
    }

    /**
     * Populate from db.
     * @param data
     */
    populate(data){
        this.id = data._id || data.id || null;
        this.credentials = data.credentials;
    }

    getCredentials(){
        return this.credentials;
    }

    /**
     * Save user state to db
     */
    save(cb){
        if(!cb){
            cb = function(){};
        }
        MyBuddy.database.users.save(this, cb);
    }

    toDb(){
        return {
            config: this.config,
            credentials: this.credentials
        }
    }
}

module.exports = User;
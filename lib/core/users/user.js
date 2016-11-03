'use strict';

var CustomEventEmitter = require('../custom-event-emitter');

class User extends CustomEventEmitter {

    //constructor(system, data){
    //    super();
    //    this.system = system;
    //
    //    if(data._id || data.id){
    //        this.id = data._id || data.id;
    //    }
    //    this.login = data.login;
    //    this.email = data.email;
    //    this.password = null;
    //    this.profil = {};
    //    this.profil.firstName = data.profil.firstName;
    //    this.profil.lastName = data.profil.lastName;
    //    this.profil.birthdate = data.profil.birthdate;
    //    this.config = data.config;
    //
    //    // Where all credentials info are stored
    //    // for example buddy / google / fb
    //    this.credentials = data.credentials;
    //}
    //
    //getCredentials(){
    //    return this.credentials;
    //}
    //
    //getConfig(){
    //    return this.config;
    //}
    //
    ///**
    // * Save user state to db
    // */
    //save(cb){
    //    if(!cb){
    //        cb = function(){};
    //    }
    //    MyBuddy.database.getAdapter('users').save(this.id, this.toDb(), cb);
    //}
    //
    //toDb(){
    //    var json = this.toJSON();
    //
    //    delete json.id;
    //
    //    return json;
    //}
    //
    //toJSON(){
    //    return {
    //        id: this.id,
    //        profil: this.profil,
    //        login: this.login,
    //        email: this.email,
    //        config: this.config,
    //        credentials: this.credentials
    //    }
    //}
    //
    //getId(){
    //    return this.id;
    //}
}

module.exports = User;
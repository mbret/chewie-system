'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');
var PersistencePlugin = require(LIB_DIR + '/persistence/plugins.js');

class MessageAdapter extends AbstractContainer{

    constructor(pluginId, id, instance, userOptions){
        super(MyBuddy, pluginId, userOptions, instance);
        this.id = id;
    }

    /**
     * Execute the message with adapter.
     * Basically it just throw an event the instance mays catch and then deal with message.
     *
     * @param message
     */
    executeMessage(message){
        this.emit('message:new', message);
    }

    getId(){
        return this.id;
    }

    /**
     *
     * @param config
     */
    //setConfig(config){
    //    if(!config){
    //        config = {};
    //    }
    //    this.config = _.merge(this.config, config);
    //}

    /**
     * Return adapter config.
     * Always return complete config (with default value).
     */
    getConfig(){
        return _.merge({
            displayName: this.id
        }, this.instance.getConfig());
    }

    //toDb(){
    //    return {
    //        id: this.id,
    //        userConfig: this.userConfig
    //    }
    //}

    /**
     * Save to db.
     * @param cb
     */
    //save(cb){
    //    if(!cb){
    //        cb = function(err){
    //
    //        }
    //    }
    //    // save to db
    //    this.daemon.database.saveOrUpdateMessageAdapter(this.id, this.toDb(), function(err){
    //        if(err){
    //            throw err;
    //        }
    //        return cb(err);
    //    });
    //}

    //static load(id, cb){
    //    MyBuddy.database.getMessageAdapter(id, function(err, entries){
    //        if(err){
    //            throw err;
    //        }
    //        return cb(err, entries);
    //    });
    //}

    saveUserOptions(options, cb){
        if(!cb) cb = function(){};

        // save to db
        PersistencePlugin.saveUserOptions(this.pluginId, this.id, 'message-adapter', options, function(err){
            return cb(err);
        });
    }

    static isInstanceValid(instance){

        if(typeof instance !== 'function'){
            return false;
        }

        if(
            !(instance.prototype.initialize instanceof Function)
            || !(instance.prototype.getConfig instanceof Function)
        ){
            return false;
        }

        return true;
    }

}

module.exports = MessageAdapter;
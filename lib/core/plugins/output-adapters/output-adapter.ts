'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');

class OutputAdapter extends AbstractContainer {

    constructor(system, pluginId, id, instance, options){
        super(system, pluginId, options, instance);
        this.id = id;
    }

    /**
     * Execute the message with adapter.
     * Basically it just throw an event the instance mays catch and then deal with message.
     *
     * @param message
     */
    executeMessage(message){
        this.instance.executeMessage(message);
    }

    /**
     * Return adapter config.
     * Always return complete config (with default value).
     */
    //getConfig(){
    //    return _.merge({
    //        displayName: this.id
    //    }, this.instance.getConfig());
    //}

    //saveUserOptions(options, cb){
    //    if(!cb) cb = function(){};
    //
    //    // save to db
    //    MyBuddy.database.getAdapter('plugins').saveUserOptions(this.pluginId, this.id, 'output-adapter', options, function(err){
    //        return cb(err);
    //    });
    //}

    static isInstanceValid(instance){

        if(typeof instance !== 'function'){
            return false;
        }

        if(
            !(instance.prototype.initialize instanceof Function)
        ){
            return false;
        }

        return true;
    }

}

module.exports = OutputAdapter;
'use strict';

var AbstractContainer = require(LIB_DIR + '/plugins/abstract-container.js');
var PersistencePlugin = require(LIB_DIR + '/persistence/plugins.js');

var _ = require('lodash');

class CoreModule extends AbstractContainer{

    constructor(pluginId, id, instance, userOptions){
        super(MyBuddy, pluginId, userOptions, instance);
        this.id = id;
    }

    /**
     * Return the plugin config.
     * @returns {object}
     */
    getConfig(){
        return this.instance.getConfig();
    }

    toJSON(){
        return _.merge(super.toJSON(), {

        })
    }

    getId(){
        return this.id;
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

    /**
     *
     * @param options
     * @param cb
     */
    saveUserOptions(options, cb){
        if(!cb) cb = function(){};

        // save to db
        PersistencePlugin.saveUserOptions(this.pluginId, this.id, 'core-module', options, function(err){
            return cb(err);
        });
    }
}

module.exports = CoreModule;
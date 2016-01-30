'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');

class MessageAdapter extends AbstractContainer{

    constructor(pluginId, id, instance, userOptions){
        super(MyBuddy, pluginId, userOptions, instance);
        this.id = id;
    }

    executeMessage(message){
        // @todo work with adapters (standalone) that register and add action name
        this.instance.execute(message);
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


}

module.exports = MessageAdapter;
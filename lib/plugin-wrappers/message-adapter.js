'use strict';

var _ = require('lodash');
var AbstractWrapper = require('./abstract-wrapper.js');

class MessageAdapter extends AbstractWrapper{

    constructor(daemon, id, instance, config, userConfig){
        super(daemon);
        this.config = config;
        this.id = id;
        this.instance = instance;
        // User config is dynamic and is stored to db
        this.userConfig = userConfig;
    }

    executeMessage(message){
        // @todo work with adapters (standalone) that register and add action name
        this.instance.execute(message);
    }

    /**
     * Set the user config options.
     * @param options
     */
    setUserConfig(options){
        this.userConfig = _.merge(this.userConfig, options);
        this.save();
        this.emit('userConfig:update', this.userConfig);
    }

    /**
     *
     * @param config
     */
    setConfig(config){
        if(!config){
            config = {};
        }
        this.config = _.merge(this.config, config);
    }

    toDb(){
        return {
            id: this.id,
            userConfig: this.userConfig
        }
    }

    /**
     * Save to db.
     * @param cb
     */
    save(cb){
        if(!cb){
            cb = function(err){

            }
        }
        // save to db
        this.daemon.database.saveOrUpdateMessageAdapter(this.id, this.toDb(), function(err){
            if(err){
                throw err;
            }
            return cb(err);
        });
    }

    static load(id, cb){
        buddy.database.getMessageAdapter(id, function(err, entries){
            if(err){
                throw err;
            }
            return cb(err, entries);
        });
    }


}

module.exports = MessageAdapter;
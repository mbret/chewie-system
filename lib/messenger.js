'use strict';
var logger = LOGGER.getLogger('Messenger');
var async = require('async');
var AdapterHelper = require(LIB_DIR + '/plugins/message-adapters/message-adapter-helper.js');
var _ = require('lodash');
var MessageAdapter = require(LIB_DIR + '/plugins/message-adapters/message-adapter.js');

/**
 *
 */
class Messenger{

    /**
     *
     */
    constructor(){

        // Contain all message adapters of the system
        // The name of adapter as key and instance as value
        this.adapters = {};
    }

    getAdapters(){
        return this.adapters;
    }

    getAdapter(id){
        if(this.adapters[id]){
            return this.adapters[id];
        }
        return null;
    }

    /**
     * Initialize each message adapters.
     * @param cb
     */
    initializeAdapters(cb){
        var self = this;

        async.forEachOf(this.getAdapters(),
            function(adapter, name, done){
                logger.debug('Initialize adapter [%s]', name);

                var initialized = false;
                adapter.instance.initialize(function(err){
                    initialized = true;
                    if(err){
                        logger.error('Error while starting adapter [%s]', name);
                        return done(err);
                    }
                    return done();
                });

                setTimeout(function(){
                    if(!initialized){
                        logger.warn('The message adapter [%s] seems to take abnormal long time to start!', name);
                    }
                }, 1500);
            },
            function(err){
                cb(err);
            }
        );
    }
}

module.exports = Messenger;
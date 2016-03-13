'use strict';

var _ = require('lodash');
var logger = LOGGER.getLogger('MessageAdaptersHandler');
var async = require('async');

class MessageAdaptersHandler{

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

    executeMessage(messageAdapters, message){
        _.forEach(messageAdapters, function(id){
            var adapter = MyBuddy.messageAdaptersHandler.getAdapter(id);

            if(adapter === null){
                logger.warn('The message adapter ' + messageAdapters + ' does not seems to be loaded. Unable to execute message');
                return;
            }

            adapter.executeMessage(message);
        });
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

module.exports = MessageAdaptersHandler;
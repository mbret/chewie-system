'use strict';
var logger = LOGGER.getLogger('Messenger');
var async = require('async');
var AdapterHelper = require(LIB_DIR + '/plugin-helpers.js').MessageAdapterHelper;
var _ = require('lodash');
var MessageAdapter = require(LIB_DIR + '/plugin-wrappers/message-adapter.js');

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

    /**
     *
     * @param name
     * @param adapter
     */
    registerMessageAdapter(name, adapter, config, cb){
        var self = this;
        if(typeof adapter !== 'function'){
            throw new Error('Unable to register message adapter [' + name + '] because it\'s not a function');
        }
        if(!(adapter.prototype.initialize instanceof Function) || !(adapter.prototype.execute instanceof Function)){
            throw new Error('An adapter [' + name + '] is trying to be register but does not seems to be valid!');
        }
        if(!config){
            config = {};
        }
        var userConfig = {};

        // try to load adapter info from db
        MessageAdapter.load(name, function(err, entry){

            if(entry){
                userConfig = _.merge(userConfig, entry.userConfig);
            }

            // Wrap adapter for system
            var messageAdapter = new MessageAdapter(MyBuddy, name, null, config, userConfig);
            var helper = new AdapterHelper(MyBuddy, messageAdapter);

            // instantiate adapter and pass helper
            var instance = new adapter(helper);

            // Store to collection
            messageAdapter.instance = instance;
            self.adapters[name] = messageAdapter;

            logger.verbose('Adapter [%s] registered', name);
            return cb(null, 'coucou');
        });
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
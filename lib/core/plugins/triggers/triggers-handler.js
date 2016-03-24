'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var path = require('path');
var async       = require('async');
var logger      = LOGGER.getLogger('TriggersHandler');

class TriggersHandler{

    initializeModules(modules, cb){
        var self = this;

        async.each(modules, function(container, done){
                var initialized = false;
                container.instance.initialize(function(err){
                    if(err){
                        logger.error('Error while starting module [%s]', container.id);
                        return done(err);
                    }
                    logger.verbose('module [%s] started', container.id);
                    MyBuddy.emit('module:' + container.id + ':started');
                    initialized = true;
                    return done();
                });

                setTimeout(function(){
                    if(!initialized){
                        logger.warn('The module %s seems to take abnormal long time to start!', container.id);
                    }
                }, 1500);
            },
            function(err){
                return cb(err);
            }
        );

    };
}

module.exports = TriggersHandler;
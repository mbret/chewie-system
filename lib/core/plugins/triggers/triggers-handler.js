'use strict';

var _ = require('lodash');
var async = require('async');

class TriggersHandler{

    constructor(){
        this.logger = MyBuddy.logger.Logger.getLogger('TriggersHandler');
    }

    initializeModules(modules, cb){
        var self = this;

        async.each(modules, function(container, done){
                var initialized = false;
                container.instance.initialize(function(err){
                    if(err){
                        self.logger.error('Error while starting module [%s]', container.id);
                        return done(err);
                    }
                    self.logger.verbose('module [%s] started', container.id);
                    MyBuddy.emit('module:' + container.id + ':started');
                    initialized = true;
                    return done();
                });

                setTimeout(function(){
                    if(!initialized){
                        self.logger.warn('The module %s seems to take abnormal long time to start!', container.id);
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
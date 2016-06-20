'use strict';

var async   = require('async');
var Task    = require(CORE_DIR + '/plugins/tasks/task');

class ModuleHandler{

    constructor(system){
        this.logger  = system.logger.Logger.getLogger('ModuleHandler');

        this.system = system;
    }

    initializeModules(modules, done){

        var self = this;
        async.forEachOf(modules, function(module, id, cb){
            self.logger.debug('Initialize module [%s]', module.id);
            var initialized = false;

            module.instance.initialize(function(err){
                initialized = true;
                return cb(err);
            });

            setTimeout(function(){
                if(!initialized){
                    logger.warn('The module [%s] seems to take abnormal long time to start!', module.id);
                }
            }, 1500);
        }, function(err){
            return done(err);
        });
    };
}

module.exports = ModuleHandler;
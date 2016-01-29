'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var path = require('path');
var ModuleScheduler   = require(LIB_DIR + '/modules/module-scheduler.js');
var PluginHelper   = require(LIB_DIR + '/plugin-helpers.js').PluginHelper;
var async       = require('async');
var logger      = LOGGER.getLogger('CoreModulesHandler');

class CoreModulesHandler{

    /**
     *
     * @param required
     * @param moduleName
     * @returns {Array}
     */
    getRequiredComponents(required, moduleName, moduletype, plugin){
        var self = this;
        var args = [];
        if(Array.isArray(required)){
            required.forEach(function(require){
                switch(require){
                    case 'daemon':
                        args.push(MyBuddy);
                        break;
                    case 'logger':
                        args.push(LOGGER.getLogger('Module - ' + moduleName));
                        break;
                    case 'scheduler':
                        args.push(new ModuleScheduler(self, moduleName, moduletype));
                        break;
                    case 'helper':
                        args.push(new PluginHelper(self.daemon, plugin));
                        break;
                    default:
                        throw new Error('Module [' + moduleName + '] try to require a component [' + require + '] that does not exist');
                        break;
                }
            });
        }
        return args;
    }

    /**
     *
     * @param cb
     * @returns {*}
     */
    loadCoreModules(){
        var self = this;
        var modules = {};

        _.forEach(MyBuddy.config.coreModules, function (module) {
            try {
                var Module = require(path.join(MyBuddy.config.appPath, MyBuddy.config.coreModulesPath + '/' + module + '/index.js'));

                var plugin = {
                    name: module,
                    messageAdapters: [],
                    modules: []
                };
                var args = [null].concat(self.getRequiredComponents(Module.require, module, 'core', plugin));

                // Module.bind as the effect of Function.prototype.bind so we need to pass Module as first parameter to apply (for the "this" of bind)
                // then also pass null to keep this reference
                var newAble = Function.prototype.bind.apply(Module, args);
                var instance = new newAble();

                logger.verbose('module:%s:loaded', module);
                logger.emit('module: ' + module + ':loaded');
                modules[module] = instance;
            }
            catch (e) {
                if(e.code === 'MODULE_NOT_FOUND'){
                    logger.error("Unable to load core module [%s] because it has been not found", module);
                }
                throw e;
            }
        });

        return modules;
    };

    startCoreModules(modules, cb){
        var self = this;

        async.forEachOfSeries(modules,
            function(instance, name, done){
                var initialized = false;
                instance.initialize(function(err){
                    if(err){
                        logger.error('Error while starting core module [%s]', name);
                        return done(err);
                    }
                    logger.verbose('Core module [%s] started', name);
                    MyBuddy.emit('module:' + name + ':started');
                    initialized = true;
                    return done();
                });

                setTimeout(function(){
                    if(!initialized){
                        logger.warn('The module %s seems to take abnormal long time to start!', name);
                    }
                }, 1500);
            },
            function(err){
                if(err){
                    return cb(err);
                }

                async.each(MyBuddy.coreModulesNew, function(module, done){

                    module.instance.initialize(done);

                }, function(err){
                    return cb(err);
                });
            }
        );

    };
}

module.exports = CoreModulesHandler;
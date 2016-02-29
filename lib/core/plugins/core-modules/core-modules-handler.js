'use strict';

var _ = require('lodash');
var path = require('path');
var PluginHelper   = require(CORE_DIR + '/plugins/plugin-helper.js').PluginHelper;
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
                        throw new Error('not supported 12');
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
    //loadCoreModules(){
    //    var self = this;
    //    var modules = {};
    //
    //    _.forEach(MyBuddy.config.coreModules, function (module) {
    //        try {
    //            var Module = require(path.join(MyBuddy.config.appPath, MyBuddy.config.coreModulesPath + '/' + module + '/index.js'));
    //
    //            var plugin = {
    //                name: module,
    //                messageAdapters: [],
    //                modules: []
    //            };
    //            var args = [null].concat(self.getRequiredComponents(Module.require, module, 'core', plugin));
    //
    //            // Module.bind as the effect of Function.prototype.bind so we need to pass Module as first parameter to apply (for the "this" of bind)
    //            // then also pass null to keep this reference
    //            var newAble = Function.prototype.bind.apply(Module, args);
    //            var instance = new newAble();
    //
    //            logger.verbose('module:%s:loaded', module);
    //            logger.emit('module: ' + module + ':loaded');
    //            modules[module] = instance;
    //        }
    //        catch (e) {
    //            if(e.code === 'MODULE_NOT_FOUND'){
    //                logger.error("Unable to load core module [%s] because it has been not found", module);
    //            }
    //            throw e;
    //        }
    //    });
    //
    //    return modules;
    //};

    startCoreModules(modules, cb){
        var self = this;

        async.each(modules, function(container, done){
                var initialized = false;
                container.instance.initialize(function(err){
                    if(err){
                        logger.error('Error while starting core module [%s]', container.id);
                        return done(err);
                    }
                    logger.verbose('Core module [%s] started', container.id);
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

module.exports = CoreModulesHandler;
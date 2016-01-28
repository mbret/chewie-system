'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var ModuleScheduler   = require(LIB_DIR + '/modules/module-scheduler.js');
var PluginHelper   = require(LIB_DIR + '/plugin-helpers.js').PluginHelper;
var path        = require('path');
var async       = require('async');
var Tasks           = require(LIB_DIR + '/modules/task.js');
var Task            = Tasks.Task;
var DirectTask      = Tasks.DirectTask;
var CommandedTask   = Tasks.CommandedTask;
var ScheduledTask   = Tasks.ScheduledTask;
var MovementCommandedTask = Tasks.MovementCommandedTask;
var logger      = LOGGER.getLogger('Module Handler');

class ModuleHandler{

    constructor(daemon, config){
        this.daemon = daemon;
        this.config = config;
        this.logger = logger;
    }

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
                        args.push(self.daemon);
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
     * @param loadPlugins
     * @param cb
     * @returns {*}
     */
    loadPlugins(done){

        var self = this;
        var repository = '';
        var plugins = [];
        if(this.config.externalModuleRepositories){
            repository = this.config.externalModuleRepositories[0] + '/';
        }

        async.each(self.config.loadPlugins, function(moduleName, cb) {

            logger.debug('Load plugin %s', moduleName);
            try{
                var Module = require(repository + moduleName);
            }
            catch(e){
                self.logger.error("Unable to load package module [%s]", moduleName);
                self.logger.error(e);
                return cb(e);
            }

            if(!ModuleHandler.isValid(Module)){
                self.logger.error('Module %s is invalid', moduleName);
            }
            else{
                try{
                    var plugin = {
                        name: moduleName,
                        messageAdapters: [],
                        modules: []
                    };
                    var args = [moduleName].concat(self.getRequiredComponents(Module.require, moduleName, 'user', plugin));
                    var instance = Module.apply(null, args);
                }
                catch(e){
                    self.logger.error("Unable to load module [%s]", moduleName);
                    self.logger.error(e);
                    return cb(e);
                }
            }
            plugins.push(plugin);

            // @todo simulate async
            setTimeout(function(){
                return cb();
            }, 1000);

        }, function(err){
            return done(err, plugins);
        });
    };

    /**
     *
     * @param cb
     * @returns {*}
     */
    loadCoreModules(){
        var self = this;
        var modules = {};

        _.forEach(this.config.coreModules, function (module) {
            try {
                var Module = require(path.join(self.config.appPath, self.config.coreModulesPath + '/' + module + '/index.js'));

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

                self.logger.verbose('module:%s:loaded', module);
                self.logger.emit('module: ' + module + ':loaded');
                modules[module] = instance;
            }
            catch (e) {
                if(e.code === 'MODULE_NOT_FOUND'){
                    self.logger.error("Unable to load core module [%s] because it has been not found", module);
                }
                throw e;
            }
        });

        return modules;
    };

    //startUserModules(modules, cb){
    //    var self = this;
    //    async.forEachOf(modules,
    //        function(instance, name, done){
    //            var moduleStarted = false;
    //            try{
    //                instance.initialize(function(err){
    //                    if(err){
    //                        self.logger.error('Error while starting core module [%s]', name);
    //                        return done(err);
    //                    }
    //                    self.logger.verbose('userModule:' + name + ':started');
    //                    self.daemon.emit('userModule:' + name + ':started');
    //                    moduleStarted = true;
    //                    return done();
    //                });
    //            }
    //            catch(e){
    //                self.logger.error('Unable to initialize module %s', name);
    //                throw e;
    //            }
    //
    //            setTimeout(function(){
    //                if(!moduleStarted){
    //                    self.logger.warn('The module %s seems to take abnormal long time to start!', name);
    //                }
    //            }, 1500);
    //        },
    //        function(err){
    //            return cb(err);
    //        }
    //    );
    //};

    startCoreModules(modules, cb){
        var self = this;

        async.forEachOfSeries(modules,
            function(instance, name, done){
                var initialized = false;
                instance.initialize(function(err){
                    if(err){
                        self.logger.error('Error while starting core module [%s]', name);
                        return done(err);
                    }
                    self.logger.verbose('Core module [%s] started', name);
                    self.daemon.emit('module:' + name + ':started');
                    initialized = true;
                    return done();
                });

                setTimeout(function(){
                    if(!initialized){
                        self.logger.warn('The module %s seems to take abnormal long time to start!', name);
                    }
                }, 1500);
            },
            function(err){
                return cb(err);
            }
        );

    };

    /**
     *
     * @param {Task} task
     * @param {function} cb
     */
    registerNewTask(task, cb){

        var self = this;

        if(!(task instanceof Task)){
            return cb(new Error('Invalid task argument'));
        }

        // DirectTask case
        // We do not save now task, they are executed once
        if(task instanceof DirectTask){
            this._executeUserTask(task);
            return cb();
        }

        // Other task case. Deferred
        // Otherwise save + execute for current process
        MyBuddy.database.saveTask(task, function(err, id){
            if(err){
                return cb(err);
            }

            self._executeUserTask(task);
            return cb();
        });
    }

    /**
     * Private
     * @param task
     * @param moduleName
     */
    _executeUserTask(task, options){
        var self = this;

        if(!(task instanceof Task)){
            throw new Error('Invalid task type');
        }

        if(!options){
            options = {};
        }

        // Check if module is loaded
        if(!MyBuddy.userModules[task.module]){
            this.logger.debug('A task for the module [%s] has been ignored because the module is not loaded', task.module);
            return;
        }

        this.logger.debug('task of type %s added for module %s - ', task.constructor.name, task.module, task);

        if(task instanceof DirectTask){
            MyBuddy.emit(task.module + ':task:new', task);
        }
        else{

            // Keep task in collection
            MyBuddy.tasks.userModules.push(task);

            /*
             * ScheduledTask
             */
            if(task instanceof ScheduledTask){
                // Subscribe to a new scheduled task for the module
                var process = ModuleScheduler.subscribe(MyBuddy, task.module, 'user', task.schedule,
                    function onNow(){
                        MyBuddy.emit(task.module + ':task:new', task);
                    }
                );
                task.scheduleProcess = process;
            }
            else if(task instanceof MovementCommandedTask){
                this.movementDetector.watch(
                    function onEnter(){
                        task.options = task.optionsOnEnter;
                        MyBuddy.emit(task.module + ':task:new', task);
                    },
                    function onExit(){
                        task.options = task.optionsOnExit;
                        MyBuddy.emit(task.module + ':task:new', task);
                    }
                )
            }
            else if(task instanceof CommandedTask){
                // @todo
            }
        }
    }

    /**
     * Check if module is valid.
     * @param Module
     * @returns {boolean}
     */
    static isValid(Module){
        if(!Module.prototype instanceof EventEmitter){
            return false;
        }
        return true;
    };
}

module.exports = ModuleHandler;


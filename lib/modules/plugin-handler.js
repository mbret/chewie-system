'use strict';


var sync = require('synchronize');
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
var logger      = LOGGER.getLogger('PluginHandler');

class PluginHandler{

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
     * @param loadPlugins
     * @param done
     * @returns {*}
     */
    loadPlugins(done){

        var self = this;
        var repository = '';
        var plugins = [];
        if(this.config.externalModuleRepositories){
            repository = this.config.externalModuleRepositories[0];
        }

        async.each(self.config.loadPlugins, function(moduleName, cb) {

            var path = repository + '/' + moduleName + '/index.js';
            logger.debug('Load plugin %s in %s', moduleName, path);
            try{
                var Module = require(path);
            }
            catch(e){
                logger.error("Unable to load package module [%s]", moduleName);
                logger.error(e);
                return cb(e);
            }

            if(!PluginHandler.isValid(Module)){
                logger.error('Module %s is invalid', moduleName);
                return cb();
            }
            else{
                try{
                    // Main plugin object wrapper
                    var plugin = {
                        name: moduleName,
                        messageAdapters: [],
                        modules: [],
                    };
                    var args = [moduleName].concat(self.getRequiredComponents(Module.require, moduleName, 'user', plugin));

                    // Code here may be forced synchronously
                    // We need this because the helper is used as synchronous method by plugin
                    // but may do asynchronous stuff
                    sync.fiber(function(){
                        Module.apply(null, args);
                        plugins.push(plugin);
                        return cb();
                    });
                }
                catch(e){
                    self.logger.error("Unable to load module [%s]", moduleName);
                    self.logger.error(e);
                    return cb(e);
                }
            }

        }, function(err){
            return done(err, plugins);
        });
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
        if(!(typeof Module === 'function')){
            return false;
        }
        //if(!(Module.prototype instanceof EventEmitter) ){
        //    return false;
        //}
        return true;
    };
}

module.exports = PluginHandler;


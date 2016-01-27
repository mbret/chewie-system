'use strict';

var fs              = require('fs');
var _               = require('lodash');
var util            = require('util');
var async           = require('async');
var EventEmitter    = require('events').EventEmitter;
var child_process   = require('child_process');
var logger          = LOGGER.getLogger('Daemon');
var ModuleHandler   = require(LIB_DIR + '/modules/module-handler.js');
var Scheduler       = require(LIB_DIR + '/scheduler.js');
var ModuleScheduler = require(LIB_DIR + '/modules/module-scheduler.js');
var Tasks           = require(LIB_DIR + '/modules/task.js');
var Task            = Tasks.Task;
var DirectTask      = Tasks.DirectTask;
var CommandedTask   = Tasks.CommandedTask;
var ScheduledTask   = Tasks.ScheduledTask;
var MovementCommandedTask = Tasks.MovementCommandedTask;
var MovementDetector = require(LIB_DIR + '/commanders/detector-commander.js');
var Persistance        = require(LIB_DIR + '/persistance.js');
var Messenger       = require(LIB_DIR + '/messenger.js');

/**
 * Daemon is the main program daemon.
 * This daemon stay alive as long as the program is not shut down.
 */
class Daemon extends EventEmitter{

    /**
     *
     */
    constructor(config){
        super();

        var self = this;

        logger.info('Starting ...');

        this.info           = {
            startedAt: new Date()
        };
        this.config         = config;
        this.database       = new Persistance(this.config);
        this.logger         = logger;
        this.scheduler      = new Scheduler(this, 'Daemon');
        this.moduleHandler  = new ModuleHandler(this, this.config);
        this.tasksOnError   = [];
        this.tasksOnShutdown   = [];

        // Detector (movement) class. Also deal with detector adapters collection
        this.movementDetector = new MovementDetector(this);

        // Messenger class. Also deal with message adapters collection
        this.messenger = new Messenger(this);

        // Contain the list of plugins loaded
        this.plugins = [];

        // Contain the list of modules
        this.userModules    = {};

        // Contain the list of running task
        this.tasks = {
            userModules: []
        };

        global.buddy = this;
        this.init();
    }

    init(){
        var self = this;
        process.on('uncaughtException', function (error) {
            logger.error('My buddy crashed because of uncaught error. The process will be terminated :(');
            logger.error(error);
            self.registerTaskOnShutdown(this.tasksOnError);
            self.shutdown(1);
        });

        async.series([

            function(cb){
                self._initialize(function(err){
                    if(!err) self.logger.info('Started and initialized');
                    return cb(err);
                });
            },

            // Watch for existing task and execute it
            function(done){

                // pass all tasks presents in config + db
                self.database.getTasks(function(err, entries){
                    if(err){
                        return done(err);
                    }
                    var tasks = self.config.tasks.concat(entries);
                    _.forEach(tasks, function(task){
                        // No need to register task, they are already saved
                        self._executeUserTask(Task.Build(task, task.type));
                    });

                    return done();
                });
            }
        ], function(err){
            if(err){
                logger.error("A critical error occurred during daemon startup. Process will be terminated");
                logger.error(err);
                self.shutdown(1);
            }
        });
    }

    /**
     *
     * @param code
     * @param restart
     */
    shutdown(processCode, restart){
        if(!processCode){
            processCode = 0; // no problem
        }
        if(restart){
            this.logger.verbose('Restarting..');
        }
        else{
            this.logger.verbose('Shutting down..');
        }
        this.emit('shutdown');

        // Process each task on shutdown
        this.logger.verbose('Process all registered shutdown task before shutdown');
        async.each(this.tasksOnShutdown, function(task, cb){
            // @todo allow some timeout before close
            task(function(err){
                // ignore error
                return cb();
            });
        }, function(err){
            // just ignore errors
            process.exit(restart ? 42 : processCode);
        });
    }

    /**
     * Restart the daemon
     */
    restart(){
        this.shutdown(0, true);
    }

    /**
     * Task have to be a synchronous function in order to work.
     * @param task
     */
    registerTaskOnError(task){
        if(!task) return;
        this.tasksOnError.push(task);
    }

    /**
     *
     * @param task
     */
    registerTaskOnShutdown(task){
        if(!task) return;

        var self = this;
        if(Array.isArray(task)){
            _.forEach(task, function(t){
                self.registerTaskOnShutdown(t);
            });
        }
        else{
            this.tasksOnShutdown.push(task);
        }
    }

    /**
     *
     * @param {Task} task
     * @param {function} cb
     */
    registerUserTask(task, cb){

        var self = this;

        if(!(task instanceof Task)){
            return cb(new Error('Invalid task argument'));
        }

        // We do not save now task, they are executed once
        if(task instanceof DirectTask){
            this._executeUserTask(task);
            return cb();
        }

        // Otherwise save + execute for current process
        this.database.saveTask(task, function(err, id){
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
        if(!self.userModules[task.module]){
            this.logger.debug('A task for the module [%s] has been ignored because the module is not loaded', task.module);
            return;
        }

        this.logger.debug('task of type %s added for module %s - ', task.constructor.name, task.module, task);

        if(task instanceof DirectTask){
            self.emit(task.module + ':task:new', task);
        }
        else{

            // Keep task in collection
            this.tasks.userModules.push(task);

            if(task instanceof ScheduledTask){
                var process = ModuleScheduler.subscribe(self, task.module, 'user', task.schedule, function(){
                    console.log(task.module + ':task:new', task);
                    self.emit(task.module + ':task:new', task);
                });
                task.scheduleProcess = process;
            }
            else if(task instanceof MovementCommandedTask){
                this.movementDetector.watch(
                    function onEnter(){
                        task.options = task.optionsOnEnter;
                        self.emit(task.module + ':task:new', task);
                    },
                    function onExit(){
                        task.options = task.optionsOnExit;
                        self.emit(task.module + ':task:new', task);
                    }
                )
            }
            else if(task instanceof CommandedTask){
                // @todo
            }
        }
    }

    // ...
    executeGpio(){
        // ...
    }

    _initialize(cb){
        var self = this;

        async.series([

            function(done){
                self.database.initialize(done);

                self.on('notification:new', function(notification){
                   self.database.saveNotif(notification);
                });
            },

            function(done){

                // Init tmp dir if not exist
                // Tmp dir is used to store mp3 and other tmp stuff
                var dir = process.cwd() + '/' + self.config.tmpDir;
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }

                var coreModules = self.moduleHandler.loadCoreModules();
                self.coreModules = coreModules;
                self.emit('coreModules:loaded');

                self.plugins = self.moduleHandler.loadPlugins();
                self.emit('userModules:loaded');
                done();
            },

            function(done){
                self.moduleHandler.startCoreModules(self.coreModules, done);
            },

            /*
             * Modules initialization
             */
            function(done){
                async.forEachOf(self.userModules, function(module, id, cb){
                    logger.debug('Initialize module [%s]', module.id);
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
            },

            /**
             * Initialize message adapters
             * @param done
             */
            function(done){
                self.messenger.initializeAdapters(done)
            }

        ], function(err){
            return cb(err);
        });
    }
}

module.exports = Daemon;
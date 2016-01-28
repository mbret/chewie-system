'use strict';

var fs              = require('fs');
var _               = require('lodash');
var util            = require('util');
var async           = require('async');
var EventEmitter    = require('events').EventEmitter;
var child_process   = require('child_process');
var logger          = LOGGER.getLogger('Daemon');
var PluginHandler   = require(LIB_DIR + '/modules/plugin-handler.js');
var Scheduler       = require(LIB_DIR + '/scheduler.js');
var ModuleScheduler = require(LIB_DIR + '/modules/module-scheduler.js');
var CoreModulesHandler = require(LIB_DIR + '/core-modules-handler.js');
var Tasks           = require(LIB_DIR + '/modules/task.js');
var Task            = Tasks.Task;
var DirectTask      = Tasks.DirectTask;
var CommandedTask   = Tasks.CommandedTask;
var ScheduledTask   = Tasks.ScheduledTask;
var MovementCommandedTask = Tasks.MovementCommandedTask;
var MovementDetector = require(LIB_DIR + '/commanders/detector-commander.js');
var Persistance        = require(LIB_DIR + '/persistance.js');
var Messenger       = require(LIB_DIR + '/messenger.js');
var Plugins         = require(LIB_DIR + '/plugins.js');

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
        this.pluginHandler  = new PluginHandler(this, this.config);
        this.coreModulesHandler = new CoreModulesHandler();
        this.tasksOnError   = [];
        this.tasksOnShutdown   = [];

        // Detector (movement) class. Also deal with detector adapters collection
        this.movementDetector = new MovementDetector(this);

        // Messenger class. Also deal with message adapters collection
        this.messenger = new Messenger();

        // Contain the list of plugins loaded
        this.plugins = [];

        // Contain the list of modules
        this.userModules    = {};

        // Contain the list of running task
        this.tasks = {
            userModules: []
        };

        global.MyBuddy = this;
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
                        self.pluginHandler._executeUserTask(Task.Build(task, task.type));
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

    // ...
    executeGpio(){
        // ...
    }

    /**
     *
     * @param cb
     * @private
     */
    _initialize(cb){
        var self = this;

        var a;
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

                var tmp = self.coreModulesHandler.loadCoreModules();
                self.coreModules = tmp;
                self.emit('coreModules:loaded');

                return done();
            },

            function(done){
                self.pluginHandler.loadPlugins(function(err, plugins){
                    self.plugins = plugins;
                    self.emit('userModules:loaded');
                    return done(err);
                });
            },

            function(done){
                self.coreModulesHandler.startCoreModules(self.coreModules, done);
            },

            // Modules initialization
            function(done){
                Plugins.initializeModules(self.userModules, done);
            },

            // Initialize message adapters
            function(done){
                self.messenger.initializeAdapters(done);
            }

        ], function(err){
            return cb(err);
        });
    }
}

module.exports = Daemon;
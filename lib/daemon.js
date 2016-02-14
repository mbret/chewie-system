'use strict';

var fs              = require('fs');
var _               = require('lodash');
var util            = require('util');
var async           = require('async');
var EventEmitter    = require('events').EventEmitter;
var child_process   = require('child_process');
var logger          = LOGGER.getLogger('Daemon');
var PluginsHandler   = require(LIB_DIR + '/plugins/plugins-handler.js');
var Scheduler       = require(LIB_DIR + '/scheduler/scheduler.js');
var CoreModulesHandler = require(LIB_DIR + '/plugins/core-modules/core-modules-handler.js');
var Speaker           = require(LIB_DIR + '/speaker.js');
var Task            = require(LIB_DIR + '/plugins/tasks/task.js');
var MessageAdaptersHandler = require(LIB_DIR + '/plugins/message-adapters/message-adapters-handler.js');
var MovementDetector = require(LIB_DIR + '/commanders/detector-commander.js');
var Persistance = require(LIB_DIR + '/persistence/persistence.js');
var ApiServer   = require(LIB_DIR + '/api-server');
var WebServer   = require(LIB_DIR + '/web-server');
var SpeechHandler = require(LIB_DIR + '/speech/speech-handler.js');
var ModuleHandler = require(LIB_DIR + '/plugins/task-modules/module-handler.js');
var TasksTriggersHandler = require(LIB_DIR + '/plugins/task-triggers/task-triggers-handler.js');
var User = require(LIB_DIR + '/user.js');
var os = require('os');
var utils = require('./utils.js');

/**
 * Daemon is the main program daemon.
 * This daemon stay alive as long as the program is not shut down.
 */
class Daemon extends EventEmitter{

    constructor(config){
        super();

        var self = this;

        logger.info('Starting ...');

        utils.initDirsSync([
            config.tmpDir,
            config.dataDir,
            config.persistenceDir
        ]);

        this.user = new User();
        this.info           = {
            startedAt: new Date()
        };
        this.config         = config;
        this.database       = new Persistance(this.config);
        this.scheduler      = new Scheduler(this, 'Daemon');
        this.pluginsHandler  = new PluginsHandler();
        this.moduleHandler = new ModuleHandler(this);
        // Also deal with message adapters collection
        this.messageAdaptersHandler = new MessageAdaptersHandler(this);
        this.tasksTriggersHandler = new TasksTriggersHandler(this);
        this.coreModulesHandler = new CoreModulesHandler();
        this.speaker = new Speaker();
        this.speechHandler = new SpeechHandler();
        this.tasksOnError   = [];
        this.tasksOnShutdown   = [];

        // Detector (movement) class. Also deal with detector adapters collection
        this.movementDetector = new MovementDetector(this);

        // Contain the list of plugins loaded
        this.plugins = [];

        // Contain the list of modules
        this.userModules = {};

        this.taskTriggers = [];
        this.coreModules = [];

        // Contain the list of running task
        this.tasks = {
            userModules: []
        };

        global.MyBuddy = this;
        this.init();
    }

    init(){

        this.speaker.play('coucou');

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
                    if(!err) logger.info('Started and initialized');
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
                        self.moduleHandler.registerNewTask(Task.Build(task, task.type), function(err){
                            if(err){
                                logger.error(err);
                            }
                        });
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
            self.speaker.play('coucou');
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
            logger.verbose('Restarting..');
        }
        else{
            logger.verbose('Shutting down..');
        }
        this.emit('shutdown');

        // Process each task on shutdown
        logger.verbose('Process all registered shutdown task before shutdown');
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

        async.series([

            /**
             * Initialize database
             * - also load users or create it for the first launch
             * @param done
             */
            self.database.initialize.bind(self.database),

            /**
             * Finally load the complete config.
             * - Config from storage will be merged with current config.
             * @param done
             */
            function(done){
                self.database.system.loadConfigOrCreate(function(err, data){
                    if(err) return done(err);

                    // Now merge db config with current config to get full config
                    self.config = _.merge(self.config, data);
                    return done();
                });
            },

            /**
             * Initialize user.
             * Create object and init + load from db.
             * @param done
             */
            self.user.initialize.bind(self.user),

            function(done){
                async.parallel([
                    // Start api server
                    function(cb){
                        self.apiServer = new ApiServer(MyBuddy);
                        self.apiServer.initialize(function(err){
                            if(err){
                                return cb(err);
                            }
                            self.emit('api-server:initialized');
                            return cb();
                        });
                    },
                    // Start web server
                    function(cb){
                        logger.debug('Load Web Server...');
                        var webServer = new WebServer(MyBuddy);
                        webServer.initialize(cb);
                    }
                ], done);
            },

            // load plugins
            function(done){
                logger.debug('Load plugins...');
                self.pluginsHandler.loadPlugins(function(err, plugins){
                    self.plugins = plugins;
                    //self.emit('userModules:loaded');
                    return done(err);
                });
            },

            // Start core module
            function(done){
                logger.debug('Start core modules...');
                self.coreModulesHandler.startCoreModules(self.coreModules, function(err){
                    if(err) return done(err);
                    self.emit('coreModules:initialized');
                    return done();
                });
            },

            // start task trigger
            function(done){
                logger.debug('Start task triggers ...');
                self.tasksTriggersHandler.startModules(self.taskTriggers, done)
            },

            // Start modules
            function(done){
                ModuleHandler.initializeModules(self.userModules, done);
            },

            // Start message adapters
            function(done){
                self.messageAdaptersHandler.initializeAdapters(done);
            }

        ], function(err){
            return cb(err);
        });
    }

    /**
     *
     * @param cb
     */
    saveConfig(cb){
        if(!cb) cb = function(){};

        // Only save some data
        // We can't save all config because it will overwrite config.js with no way to update some
        // options.
        var data = {
            foo: MyBuddy.config.foo
        };

        this.database.system.saveConfig(data, cb);
    }
}

module.exports = Daemon;
'use strict';

var fs              = require('fs');
var _               = require('lodash');
var util            = require('util');
var async           = require('async');
var EventEmitter    = require('events').EventEmitter;
var child_process   = require('child_process');
var logger          = LOGGER.getLogger('Daemon');
var PluginsHandler   = require(LIB_DIR + '/plugins/plugins-handler.js');
var Scheduler       = require(LIB_DIR + '/scheduler.js');
var CoreModulesHandler = require(LIB_DIR + '/plugins/core-modules/core-modules-handler.js');
var Speak           = require(LIB_DIR + '/speaker.js');
var Tasks           = require(LIB_DIR + '/plugins/tasks/task.js');
var Task            = Tasks.Task;
var MessageAdaptersHandler = require(LIB_DIR + '/plugins/message-adapters/message-adapters-handler.js');
var MovementDetector = require(LIB_DIR + '/commanders/detector-commander.js');
var Persistance = require(LIB_DIR + '/persistance.js');
var Messenger   = require(LIB_DIR + '/messenger.js');
var ApiServer   = require(LIB_DIR + '/api-server');
var WebServer   = require(LIB_DIR + '/web-server');
var SpeechHandler = require(LIB_DIR + '/speech/speech-handler.js');
var ModuleHandler = require(LIB_DIR + '/plugins/modules/module-handler.js');
var TasksTriggersHandler = require(LIB_DIR + '/plugins/task-triggers/tasks-triggers-handler.js');

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
        this.pluginsHandler  = new PluginsHandler();
        this.moduleHandler = new ModuleHandler(this);
        this.messageAdaptersHandler = new MessageAdaptersHandler(this);
        this.tasksTriggersHandler = new TasksTriggersHandler(this);
        this.coreModulesHandler = new CoreModulesHandler();
        this.speak = new Speak();
        this.speechHandler = new SpeechHandler();
        this.tasksOnError   = [];
        this.tasksOnShutdown   = [];

        // Detector (movement) class. Also deal with detector adapters collection
        this.movementDetector = new MovementDetector(this);

        // Messenger class. Also deal with message adapters collection
        this.messenger = new Messenger();

        // Contain the list of plugins loaded
        this.plugins = [];

        // Contain the list of modules
        this.userModules = {};

        this.taskTriggers = [];

        // @todo supprimer pour la nouvelle gestion
        //this.coreModules = {};

        this.coreModules = [];

        // Contain the list of running task
        this.tasks = {
            userModules: []
        };

        global.MyBuddy = this;
        this.init();
    }

    init(){

        this.speak.play('coucou');

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
            self.speechHandler.executeCommand('Say something');
            self.speechHandler.registerNewCommand('restart', function(){
                self.restart();
            })
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

                return done();
            },

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
                self.messenger.initializeAdapters(done);
            }

        ], function(err){
            return cb(err);
        });
    }
}

module.exports = Daemon;
'use strict';

var fs              = require('fs');
var _               = require('lodash');
var util            = require('util');
var async           = require('async');
var CustomEventEmitter = require('./CustomEventEmitter');
var child_process   = require('child_process');
var logger          = LOGGER.getLogger('Daemon');
var PluginsHandler   = require(CORE_DIR + '/plugins/plugins-handler.js');
var Scheduler       = require(MODULES_DIR + '/scheduler').scheduler;
var ConfigHandler   = require(CORE_DIR + '/config-handler.js');
var CoreModulesHandler = require(CORE_DIR + '/plugins/core-modules/core-modules-handler.js');
var Speaker           = require(CORE_DIR + '/speaker.js');
var Task            = require(CORE_DIR + '/plugins/tasks/task.js');
var MessageAdaptersHandler = require(CORE_DIR + '/plugins/message-adapters/message-adapters-handler.js');
var MovementDetector = require(CORE_DIR + '/commanders/detector-commander.js');
var Persistence = require(CORE_DIR + '/persistence/persistence.js');
var ApiServer   = require(CORE_DIR + '/api-server');
var WebServer   = require(CORE_DIR + '/web-server');
var SpeechHandler = require(CORE_DIR + '/speech/speech-handler.js');
var ModuleHandler = require(CORE_DIR + '/plugins/task-modules/module-handler.js');
var TasksTriggersHandler = require(CORE_DIR + '/plugins/triggers/task-triggers-handler.js');
var User = require(CORE_DIR + '/user.js');
var os = require('os');
var utils = require(MODULES_DIR + '/utils');
var NotificationService = require('./notification-service');
var ip = require('ip');

/**
 * Daemon is the main program daemon.
 * This daemon stay alive as long as the program is not shut down.
 */
class Daemon extends CustomEventEmitter{

    constructor(config){
        super();

        var self = this;
        global.MyBuddy = this;

        logger.info('Starting...');

        this.logger = logger;

        utils.initDirsSync([
            config.tmpDir,
            config.dataDir,
            config.persistenceDir
        ]);

        self.user = new User();
        self.info           = {
            startedAt: new Date()
        };
        self.config         = config;
        this.config.realIp  = ip.address();
        self.database       = new Persistence(self.config);
        self.scheduler      = new Scheduler(self, 'Daemon');
        self.pluginsHandler = new PluginsHandler();
        self.moduleHandler  = new ModuleHandler(self);
        self.notificationService = new NotificationService(self);
        // Also deal with message adapters collection
        self.messageAdaptersHandler = new MessageAdaptersHandler(self);
        self.tasksTriggersHandler = new TasksTriggersHandler(self);
        self.coreModulesHandler = new CoreModulesHandler();
        self.speaker = new Speaker();
        self.speechHandler = new SpeechHandler();
        self.tasksOnError   = [];
        self.tasksOnShutdown   = [];
        self.webServer = new WebServer(self);
        self.apiServer = new ApiServer(self);

        // Detector (movement) class. Also deal with detector adapters collection
        self.movementDetector = new MovementDetector(self);

        self.plugins        = []; // Contain an array of plugin object.
        self.userModules    = []; // Contain the list of modules
        self.taskTriggers   = [];
        self.coreModules    = [];
        self.tasks          = []; // Contain the list of running task

        self.init();
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
                require('./bootstrap').call(self, function(err){
                    if(err) return cb(err);

                    logger.info('The system is now started and ready!');

                    // Splash final information
                    logger.info('The web server is available at http://localhost:' + self.webServer.server.address().port + ' ' +
                        'or http://' + self.config.realIp + ':' + self.webServer.server.address().port + ' for remote access');
                    logger.info('The API is available at at http://localhost:' + self.apiServer.server.address().port + ' ' +
                        'or http://' + self.config.realIp + ':' + self.apiServer.server.address().port + ' for remote access');

                    console.log('');
                    return cb();
                });
            },

            // Watch for existing task and execute it
            function(done){

                // pass all tasks presents in config + db
                self.database.getTasks(function(err, entries){
                    if(err){
                        return done(err);
                    }
                    var tasks = _.cloneDeep(self.config.tasks.concat(entries));
                    _.forEach(tasks, function(task){

                        // No need to save again, just register.
                        self.moduleHandler.registerNewTask(Task.Build(_.merge(task, { system: self })), function(err){
                            if(err){
                                logger.error(err);
                            }
                        });
                    });

                    return done();
                });
            },

            function(done){
                //self.taskTriggers[0].initialize({});
                return done();
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
     * @param processCode
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
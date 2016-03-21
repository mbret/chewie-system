'use strict';

var fs                  = require('fs');
var _                   = require('lodash');
var util                = require('util');
var async               = require('async');
var CustomEventEmitter  = require(CORE_DIR + '/custom-event-emitter');
var child_process       = require('child_process');
var logger              = LOGGER.getLogger('Daemon');
var PluginsHandler      = require(CORE_DIR + '/plugins/plugins-handler.js');
var Scheduler           = require('my-buddy-lib').scheduler.Scheduler;
var CoreModulesHandler  = require(CORE_DIR + '/plugins/core-modules/core-modules-handler.js');
var Speaker             = require(CORE_DIR + '/speaker.js');
var Task                = require(CORE_DIR + '/plugins/tasks/task.js');
var outputAdapters      = require(CORE_DIR + '/plugins/output-adapters');
var MessageAdaptersHandler = outputAdapters.OutputAdaptersHandler;
var user                = require(CORE_DIR + '/users');
var persistence         = require(CORE_DIR + '/persistence');
var ApiServer           = require(LIB_DIR + '/api-server').Server;
var WebServer           = require(LIB_DIR + '/web-server');
var ConfigHandler       = require(CORE_DIR + '/config-handler');
var SpeechHandler       = require(CORE_DIR + '/speech/speech-handler.js');
var ModuleHandler       = require(CORE_DIR + '/plugins/task-modules/module-handler.js');
var TriggersHandler     = require(CORE_DIR + '/plugins/triggers/triggers-handler.js');
var os                  = require('os');
var NotificationService = require(CORE_DIR + '/notification-service');
var taskQueue           = require('my-buddy-lib').taskQueue;
var ProfileManager      = require(CORE_DIR + '/profile-manager');

/**
 * Daemon is the main program daemon.
 * This daemon stay alive as long as the program is not shut down.
 */
class Daemon extends CustomEventEmitter{

    constructor(configOverride){
        super();

        logger.info('Starting...');

        global.MyBuddy = this;

        this.configHandler          = new ConfigHandler(this, configOverride);
        this.orm                    = new persistence.Orm();
        this.userAuthentication     = new user.UserAuthentication(this);
        this.database               = new persistence.Persistence(this);
        this.scheduler              = new Scheduler(this, 'Daemon');
        this.pluginsHandler         = new PluginsHandler(this);
        this.moduleHandler          = new ModuleHandler(this);
        this.notificationService    = new NotificationService(this);
        this.messageAdaptersHandler = new MessageAdaptersHandler(this);
        this.triggersHandler        = new TriggersHandler(this);
        this.coreModulesHandler     = new CoreModulesHandler(this);
        this.speaker                = new Speaker(this);
        this.speechHandler          = new SpeechHandler();
        this.webServer              = new WebServer(this);
        this.apiServer              = new ApiServer(this);
        this.profileManager         = new ProfileManager(this);
        this.plugins                = []; // Contain an array of plugin object.
        this.userModules            = []; // Contain the list of modules
        this.triggers               = [];
        this.coreModules            = [];
        this.tasks                  = []; // Contain the list of running task
        this.info = {
            startedAt: new Date()
        };

        this.init();
    }

    init(){
        var self = this;

        // We should not do anything here
        // The system is in undefined state
        process.on('uncaughtException', self._onUnexpectedError.bind(self));
        process.on('unhandledRejection', self._onUnexpectedError.bind(self));

        this.on('shutdown', function(){
            logger.info('The system is shutting down');
        });

        this.on('restarting', function(){
            logger.info('The system is restarting');
        });

        require('./bootstrap')(self, logger, function(err){
            if(err){
                logger.error("A critical error occurred during daemon startup. Process will be terminated");
                logger.error(err);
                self.shutdown(1, null);
            }

            // Splash final information
            logger.info('The system is now started and ready!');
            logger.info('The web interface is available at at %s or %s for remote access', self.webServer.getLocalAddress(), self.webServer.getRemoteAddress());
            logger.info('The API is available at at %s or %s for remote access', self.apiServer.getLocalAddress(), self.apiServer.getRemoteAddress());
            console.log('');

            // on new profile to start register some stuff
            taskQueue.register('profile:started', function(cb){
                async.series([

                    function(done){
                        async.parallel([

                            // load plugins
                            function(done2){
                                logger.debug('Load plugins...');
                                self.pluginsHandler.loadPlugins(function(err, plugins){
                                    self.plugins = plugins;
                                    return done2(err);
                                });
                            },

                            // Start core module
                            function(done2){
                                logger.debug('Start core modules...');
                                self.coreModulesHandler.startCoreModules(self.coreModules, function(err){
                                    if(err) return done2(err);
                                    self.emit('coreModules:initialized');
                                    return done2();
                                });
                            },

                            // start task trigger
                            function(done2){
                                logger.debug('Start task triggers ...');
                                self.triggersHandler.startModules(self.triggers, done2)
                            },

                            // Start modules
                            function(done2){
                                self.moduleHandler.initializeModules(self.userModules, done2);
                            },

                            // Start message adapters
                            function(done2){
                                self.messageAdaptersHandler.initializeAdapters(done2);
                            }
                        ], done);
                    },

                    function(done){
                        setImmediate(function(){
                            logger.info('Process user stored tasks');

                            // pass all tasks presents in config + db
                            self.database.getTasks(function(err, entries){
                                if(err){
                                    return logger.error(err);
                                }
                                var tasks = _.cloneDeep(self.configHandler.getConfig().tasks.concat(entries));
                                _.forEach(tasks, function(task){

                                    // No need to save again, just register.
                                    self.moduleHandler.registerTask(Task.Build(self, task), function(err){
                                        if(err){
                                            logger.error(err);
                                        }
                                    });
                                });

                                return done();
                            });
                        });
                    }

                ], function(err){
                    return cb(err);
                });
            });

            // get admin id
            self.orm.models.User.findOne({where: {username: 'admin'}}).then(function(data){
                self.profileManager.startProfile(data.id).then(function(){
                    self.profileManager.stopProfile();
                });
            });
        });
    }

    /**
     *
     * @param processCode null|0 by default
     * @param restart
     */
    shutdown(processCode, restart){
        if(!processCode){
            processCode = 0; // no problem
        }

        this.emit(restart ? 'restarting' : 'shutdown');

        // Process each task on shutdown
        logger.verbose('Process all registered shutdown task before shutdown');
        taskQueue.proceed('shutdown', { stopOnError: false }, function(){
            // ignore error
            process.exit(restart ? 42 : processCode);
        });
    }

    /**
     * Restart the daemon
     */
    restart(){
        this.shutdown(0, true);
    }

    getInfo(){
        return _.merge(this.info, {
            uptime: process.uptime(),
            nodeVersions: process.versions,
        });
    }

    getConfig(){
        return this.configHandler.getSystemConfig();
    }

    _onUnexpectedError(error){
        logger.error('My buddy crashed because of uncaught error. The process will be terminated :(');
        logger.error(error);
        process.exit(1);
    }
}

module.exports = Daemon;
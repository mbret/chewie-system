'use strict';

var fs                  = require('fs');
var _                   = require('lodash');
var util                = require('util');
var async               = require('async');
var CustomEventEmitter  = require(CORE_DIR + '/custom-event-emitter');
var child_process       = require('child_process');
var logger              = LOGGER.getLogger('Daemon');
var PluginsHandler      = require(CORE_DIR + '/plugins/plugins-handler.js');
var Scheduler           = require(MODULES_DIR + '/scheduler').scheduler;
var CoreModulesHandler  = require(CORE_DIR + '/plugins/core-modules/core-modules-handler.js');
var Speaker             = require(CORE_DIR + '/speaker.js');
var Task                = require(CORE_DIR + '/plugins/tasks/task.js');
var MessageAdaptersHandler = require(CORE_DIR + '/plugins/message-adapters/message-adapters-handler.js');
var Persistence         = require(CORE_DIR + '/persistence').Persistence;
var ApiServer           = require(CORE_DIR + '/api-server').Server;
var WebServer           = require(CORE_DIR + '/web-server');
var ConfigHandler       = require(CORE_DIR + '/config-handler');
var SpeechHandler       = require(CORE_DIR + '/speech/speech-handler.js');
var ModuleHandler       = require(CORE_DIR + '/plugins/task-modules/module-handler.js');
var TriggersHandler     = require(CORE_DIR + '/plugins/triggers/triggers-handler.js');
var User                = require(CORE_DIR + '/user.js');
var os                  = require('os');
var utils               = require(MODULES_DIR + '/utils');
var NotificationService = require(CORE_DIR + '/notification-service');

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
        this.info = {
            startedAt: new Date()
        };
        this.user = new User();
        this.configHandler          = new ConfigHandler(this, config);
        this.database               = new Persistence(this);
        this.scheduler              = new Scheduler(this, 'Daemon');
        this.pluginsHandler         = new PluginsHandler(this);
        this.moduleHandler          = new ModuleHandler(this);
        this.notificationService    = new NotificationService(this);
        this.messageAdaptersHandler = new MessageAdaptersHandler(this);
        this.triggersHandler        = new TriggersHandler(this);
        this.coreModulesHandler     = new CoreModulesHandler();
        this.speaker                = new Speaker();
        this.speechHandler          = new SpeechHandler();
        this.tasksOnError           = [];
        this.tasksOnShutdown        = [];
        this.webServer              = new WebServer(this);
        this.apiServer              = new ApiServer(this);
        this.plugins        = []; // Contain an array of plugin object.
        this.userModules    = []; // Contain the list of modules
        this.triggers       = [];
        this.coreModules    = [];
        this.tasks          = []; // Contain the list of running task

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

        this.on('shutdown', function(){
            logger.info('The system is shutting down');
        });

        this.on('restarting', function(){
            logger.info('The system is restarting');
        });

        require('./bootstrap')(self, function(err){
            if(err){
                logger.error("A critical error occurred during daemon startup. Process will be terminated");
                logger.error(err);
                self.shutdown(1);
            }

            // Splash final information
            logger.info('The system is now started and ready!');
            logger.info('The web server is available at http://localhost:' + self.webServer.server.address().port + ' ' +
                'or http://' + self.configHandler.getConfig().realIp + ':' + self.webServer.server.address().port + ' for remote access');
            logger.info('The API is available at at http://localhost:' + self.apiServer.server.address().port + ' ' +
                'or http://' + self.configHandler.getConfig().realIp + ':' + self.apiServer.server.address().port + ' for remote access');
            console.log('');

            self._processPostponedTasks();
        });
    }

    _processPostponedTasks(){
        var self = this;

        setImmediate(function(){
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
     * @returns {User}
     */
    getCurrentUser(){
        return this.user;
    }

    getInfo(){
        return this.info;
    }
}

module.exports = Daemon;
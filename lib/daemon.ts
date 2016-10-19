'use strict';

var async               = require('async');
var childProcess        = require('child_process');
var _                   = require('lodash');
var PluginsHandler      = require(CORE_DIR + '/plugins/plugins-handler.js');
var WebServer           = require(LIB_DIR + '/client-web-server');
var SpeechHandler       = require(CORE_DIR + '/speech/speech-handler.js');
var NotificationService = require(CORE_DIR + '/notification-service');
var taskQueue           = require('my-buddy-lib').taskQueue;
var repositories        = require(CORE_DIR + '/repositories');
var utils               = require('my-buddy-lib').utils;
var path                = require('path');
var packageInfo         = require(ROOT_DIR + '/package.json');
var Logger              = require('my-buddy-lib').logger.Logger;
var Bus                 = require(CORE_DIR + '/bus');
var api                 = require(CORE_DIR + "/api");
var ip  = require('ip');
import { EventEmitter }  from "events";
import * as ServerCommunication from "./core/server-communication/index";
import {ScenarioReader} from "./core/scenario/scenario-reader";
import {ModuleLoader} from "./core/plugins/modules/module-loader";
import {Bootstrap} from "./bootstrap";
import {Runtime} from "./core/runtime";
import {ModuleContainer} from "./core/plugins/modules/module-container";
import {Server as ApiServer} from "./server-api";
import {TaskExecution} from "./core/plugins/tasks/task-execution";
import {Hook, HookConstructor} from "./core/hook";
import {PluginLoader} from "./core/plugins/plugin-loader";
import {Speaker} from "./core/speaker/speaker";

/**
 * Daemon is the main program daemon.
 * This daemon stay alive as long as the program is not shut down.
 */
export class Daemon extends EventEmitter {

    executingTasks: Map<string, TaskExecution>;
    modules: Map<string, ModuleContainer>;
    runtime: Runtime;
    apiServer: ApiServer;
    config: any;
    serverSocketEventsListener: ServerCommunication.SocketEventsListener;
    scenarioReader: ScenarioReader;
    moduleLoader: ModuleLoader;
    pluginLoader: PluginLoader;
    hooksToLoad: Array<HookConstructor>;
    logger: any;
    speaker: Speaker;

    constructor(configOverride){
        super();

        this.config = configOverride;
        this.logger = LOGGER.getLogger('Daemon');
        this.logger.Logger = LOGGER;
        this.logger.getLogger = LOGGER.getLogger.bind(LOGGER);

        this.logger.info('Starting...');

        global.MyBuddy = this;

        this.info = {
            startedAt: new Date(),
            version: packageInfo.version
        };
        // Used to handle running profile / tasks / etc
        this.serverSocketEventsListener = new ServerCommunication.SocketEventsListener(this);
        this.runtime = this.runtimeHelper = new Runtime(this);
        this.apiServer              = new ApiServer(this);
        this.webServer              = new WebServer(this);
        this.pluginsHandler         = new PluginsHandler(this);
        this.notificationService    = new NotificationService(this);
        this.apiService             = new api.ApiService(this);
        this.speaker                = new Speaker(this);
        this.speechHandler          = new SpeechHandler();
        this.localRepository        = new repositories.LocalRepository(this);
        this.repository             = new repositories.Repository(this);
        this.scenarioReader = new ScenarioReader(this);
        this.moduleLoader = new ModuleLoader(this);
        this.pluginLoader = new PluginLoader(this);
        // Contain modules by their names
        this.modules = new Map();
        // Contain tasks by their id
        this.executingTasks = new Map();
        this.hooksToLoad = [];
        this.bus = new Bus(this);
    }

    init(cb) {
        var self = this;

        // We should not do anything here
        // The system is in undefined state
        process.on('uncaughtException', function(err){
            self.logger.error('My buddy crashed because of uncaught error. The process will be terminated :(');
            self._onUnexpectedError(err);
        });

        process.on('unhandledRejection', function(err){
            self.logger.error('My buddy crashed because of uncaught promise error. The process will be terminated :(');
            self._onUnexpectedError(err);
        });

        // Intercept ctrl+c or console quit
        process.on('SIGINT', function() {
            self.shutdown();
        });

        // Intercept process.kill
        process.on('SIGTERM', function() {
            self.shutdown();
        });

        this.on('shutdown', function(){
            self.logger.info('The system is shutting down');
        });

        this.on('restarting', function(){
            self.logger.info('The system is restarting');
        });

        // listen and forward some core events
        this.runtimeHelper.profileManager.on("profile:start", this.emit.bind(this, "profile:start"));

        this.runBootstrap(function(err){
            if(err){
                errorOnStartup(err);
                return;
            }

            // Splash final information
            self.logger.info('The system is now started and ready!');
            self.logger.info('The web interface is available at at %s or %s for remote access', self.webServer.getLocalAddress(), self.webServer.getRemoteAddress());
            self.logger.info('The API is available at at %s or %s for remote access', self.apiServer.getLocalAddress(), self.config.apiEndpointAddress);
            console.log('');

            // Play some system sounds
            self.playSystemSound('start_up.wav');
            self.runtimeHelper.profile.on('profile:start:complete', function(){
                self.playSystemSound('profile_loaded.wav');
            });

            // Try to start profile if one is defined on startup
            var profileToLoad = self.config.profileToLoadOnStartup;
            if(profileToLoad) {
                self.runtimeHelper.profile.startProfile(profileToLoad)
                    .then(function(){
                        self.logger.info("Profile %s has been started", profileToLoad);
                    })
                    .catch(errorOnStartup);
            }

            return cb();
        });

        function errorOnStartup(err) {
            self.logger.error("A critical error occurred during daemon startup. Process will be terminated.");
            self.logger.error(err);
            self.shutdown(1, null);
        }
    }

    /**
     * @param processCode null|0 by default
     * @param restart
     */
    shutdown(processCode, restart){
        if(!processCode){
            processCode = 0; // no problem
        }

        this.emit(restart ? 'restarting' : 'shutdown');

        // Process each task on shutdown
        this.logger.verbose('Process all registered shutdown task before shutdown');
        taskQueue.proceed('shutdown', { stopOnError: false }, function(){
            // ignore error
            process.exit(restart ? 42 : processCode);
        });
    }

    restart(){
        this.shutdown(0, true);
    }

    getInfo(){
        return _.merge(this.info, {
            uptime: process.uptime(),
            nodeVersions: process.versions
        });
    }

    _onUnexpectedError(error){
        // kill speaker to avoid having phantom sounds if system crash
        this.speaker.kill();
        this.logger.error(error);
        process.exit(1);
    }

    /**
     * Run the core bootstrap then the user bootstrap if it exist.
     * @param done
     */
    runBootstrap(done){
        var self = this;

        // run core bootstrap
        self.logger.debug("Run system bootstrap...");
        var bootstrap = new Bootstrap(this);
        bootstrap.bootstrap(function(err) {
            if (err) {
                return done(err);
            }

            // run user bootstrap if exist
            var UserBootstrapModule = self.config.bootstrap || null;
            if (UserBootstrapModule) {
                self.logger.debug("A user bootstrap has been found, run it");
                var userBootstrap = new UserBootstrapModule();
                userBootstrap.bootstrap(self, done);
            }
        });

        // I do not know why but a bug with bluebird make promise in userBootstrap catch uncaughtException
        // that may occurs later in sequentially code which trigger the cb passed twice ... We also lost trace for real uncaughtException error
        // setImmediate(function(){
        //     return done(err);
        // });
    }

    /**
     * Helper for system sounds
     * @check C:\Windows\Media\Garden
     * @param {string} file
     * @param {object} options
     */
    playSystemSound(file: string, options: any){
        return this.speaker.playFile(path.join(this.config.resourcesDir, 'system', file), options);
    }

    /**
     * Register a synchronized task
     * Example of available events: shutdown, ...
     *
     * @param event
     * @param cb
     */
    registerTask(event: string, cb: Function) {
        taskQueue.register(event, cb);
    }
}

/**
 *
 * @param userConfig
 * @param cb
 */
Daemon.start = function(userConfig, cb){
    cb = cb || function(){};
    userConfig = userConfig || {};

    if(typeof userConfig === 'function'){
        cb = userConfig;
        userConfig = {};
    }

    // Build system config
    var config = _.merge(utils.loadConfig(__dirname + '/configuration/default'), userConfig);

    // Set some config now (only possible during runtime or when forced)
    config.system.pluginsTmpDir = config.system.pluginsTmpDir || path.resolve(config.system.tmpDir, 'plugins');
    config.system.pluginsDataDir = config.system.pluginsDataDir || path.resolve(config.system.dataDir, 'plugins');
    config.system.synchronizedPluginsDir = config.system.synchronizedPluginsDir || path.resolve(config.system.dataDir, 'synchronized-plugins');
    config.realIp = ip.address();
    config.apiEndpointAddress = config.apiEndpointAddress || "https://" + (config.realIp + ':' + config.apiPort);

    console.log(config.apiEndpointAddress);
    // Build system logger
    global.LOGGER = new Logger(config.log);
    var logger = LOGGER.getLogger('Daemon');

    logger.info('Start daemon');

    checkRequiredModules(function(err, missingModules){
        if(err) throw err;
        if(missingModules.length > 0){
            logger.error('It seems that some required global modules are not installed. Please verify these modules: ' + missingModules.join(', ') );
            process.exit(0);
        }

        // init required folders
        utils.initDirsSync([
            config.system.tmpDir,
            config.system.dataDir,
            // config.system.persistenceDir,
            config.system.pluginsTmpDir,
            path.resolve(config.system.dataDir, 'plugins')
        ]);

        var daemon = new Daemon(config);
        daemon.init(function(err){
            return cb(err, daemon);
        });
    });

    /**
     * Check for required global modules.
     * @param cb
     */
    function checkRequiredModules(cb){
        var missingModules = [];

        async.parallel([
            function(done){
                childProcess.exec('gulp -v', function(err){
                    if(err){
                        missingModules.push('gulp');
                    }
                    return done();
                });
            },
        ], function(err){
            return cb(null, missingModules);
        });
    }
};

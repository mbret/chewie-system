'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var async = require('async');
var PluginsHandler = require('./core/plugins/plugins-handler.js');
var SpeechHandler = require('./core/speech/speech-handler.js');
var NotificationService = require('./core/notification-service');
var taskQueue = require('my-buddy-lib').taskQueue;
var repositories = require('./core/repositories');
var utils = require('my-buddy-lib').utils;
var path = require('path');
var packageInfo = require(__dirname + '/../package.json');
var Logger = require('my-buddy-lib').logger.Logger;
var Bus = require('./core/bus');
var api = require("./core/api");
var events_1 = require("events");
var ServerCommunication = require("./core/server-communication/index");
var scenario_reader_1 = require("./core/scenario/scenario-reader");
var module_loader_1 = require("./core/plugins/modules/module-loader");
var bootstrap_1 = require("./bootstrap");
var runtime_1 = require("./core/runtime");
var shared_server_api_1 = require("./shared-server-api");
var plugins_loader_1 = require("./core/plugins/plugins-loader");
var speaker_1 = require("./core/speaker/speaker");
var loader_1 = require("./configuration/loader");
var local_1 = require("./core/repositories/local");
var storage_1 = require("./core/storage/storage");
/**
 * Daemon is the main program daemon.
 * This daemon stay alive as long as the program is not shut down.
 */
var Daemon = (function (_super) {
    __extends(Daemon, _super);
    /**
     *
     */
    function Daemon() {
        _super.call(this);
        global.MyBuddy = this;
        // Contain tasks by their id
        this.executingTasks = new Map();
        this.hooksToLoad = [];
        this.storage = new storage_1.default(this);
        this.info = {
            startedAt: new Date(),
            version: packageInfo.version,
            nodeVersions: process.versions
        };
    }
    /**
     * Application entry point.
     * @param userConfig
     * @param cb
     * @constructor
     */
    Daemon.prototype.start = function (userConfig, cb) {
        if (userConfig === void 0) { userConfig = {}; }
        if (cb === void 0) { cb = function (err) { }; }
        var self = this;
        // load config
        this.config = loader_1.default(userConfig);
        // Build system logger
        global.LOGGER = new Logger(self.config.log);
        var logger = LOGGER.getLogger('Daemon');
        logger.info('Start daemon');
        // init required folders
        utils.initDirsSync([
            self.config.system.tmpDir,
            self.config.system.dataDir,
            // config.system.persistenceDir,
            self.config.system.pluginsTmpDir,
            path.resolve(self.config.system.dataDir, 'plugins')
        ]);
        this.logger = LOGGER.getLogger('Daemon');
        this.logger.Logger = LOGGER;
        this.logger.getLogger = LOGGER.getLogger.bind(LOGGER);
        this.logger.info('Starting...');
        // Used to handle running profile / tasks / etc
        this.communicationBus = new ServerCommunication.CommunicationBus(this);
        this.runtime = new runtime_1.Runtime(this);
        this.apiServer = new shared_server_api_1.Server(this);
        this.pluginsHandler = new PluginsHandler(this);
        this.notificationService = new NotificationService(this);
        this.apiService = new api.ApiService(this);
        this.speaker = new speaker_1.Speaker(this);
        this.localRepository = new local_1.default(this);
        this.repository = new repositories.Repository(this);
        this.scenarioReader = new scenario_reader_1.ScenarioReader(this);
        this.moduleLoader = new module_loader_1.ModuleLoader(this);
        this.pluginsLoader = new plugins_loader_1.PluginsLoader(this);
        this.bus = new Bus(this);
        this.speechHandler = new SpeechHandler();
        this.init(function (err) {
            return cb(err);
        });
    };
    /**
     * @param processCode null|0 by default
     * @param restart
     */
    Daemon.prototype.shutdown = function (processCode, restart) {
        if (processCode === void 0) { processCode = undefined; }
        if (restart === void 0) { restart = undefined; }
        if (!processCode) {
            processCode = 0; // no problem
        }
        this.emit(restart ? 'restarting' : 'shutdown');
        // Process each task on shutdown
        this.logger.verbose('Process all registered shutdown task before shutdown');
        taskQueue.proceed('shutdown', { stopOnError: false }, function () {
            // ignore error
            process.exit(restart ? 42 : processCode);
        });
    };
    Daemon.prototype.restart = function () {
        this.shutdown(0, true);
    };
    Daemon.prototype.init = function (cb) {
        var self = this;
        // We should not do anything here
        // The system is in undefined state
        process.on('uncaughtException', function (err) {
            self.logger.error('My buddy crashed because of uncaught error. The process will be terminated :(');
            self._onUnexpectedError(err);
        });
        process.on('unhandledRejection', function (err) {
            self.logger.error('My buddy crashed because of uncaught promise error. The process will be terminated :(');
            self._onUnexpectedError(err);
        });
        // Intercept ctrl+c or console quit
        process.on('SIGINT', function () {
            self.shutdown();
        });
        // Intercept process.kill
        process.on('SIGTERM', function () {
            self.shutdown();
        });
        this.on('shutdown', function () {
            self.logger.info('The system is shutting down');
        });
        this.on('restarting', function () {
            self.logger.info('The system is restarting');
        });
        // listen and forward some core events
        // this.runtimeHelper.profileManager.on("profile:start", this.emit.bind(this, "profile:start"));
        this.runBootstrap(function (err) {
            if (err) {
                errorOnStartup(err);
                return;
            }
            // Splash final information
            self.logger.info('The system is now started and ready!');
            //self.logger.info('The web interface is available at at %s or %s for remote access', self.webServer.getLocalAddress(), self.webServer.getRemoteAddress());
            self.logger.info('The API is available at %s or %s for remote access', self.apiServer.getLocalAddress(), self.config.sharedApiUrl);
            console.log('');
            // Play some system sounds
            self.playSystemSound('start_up.wav');
            // self.runtimeHelper.profile.on('profile:start:complete', function(){
            //     self.playSystemSound('profile_loaded.wav');
            // });
            return cb();
        });
        function errorOnStartup(err) {
            self.logger.error("A critical error occurred during daemon startup. Process will be terminated.");
            self.logger.error(err);
            self.shutdown(1, null);
        }
    };
    Daemon.prototype._onUnexpectedError = function (error) {
        // kill speaker to avoid having phantom sounds if system crash
        this.speaker.kill();
        this.logger.error(error);
        process.exit(1);
    };
    /**
     * Run the core bootstrap then the user bootstrap if it exist.
     * @param done
     */
    Daemon.prototype.runBootstrap = function (done) {
        var self = this;
        // run core bootstrap
        self.logger.debug("Run system bootstrap...");
        var bootstrap = new bootstrap_1.Bootstrap(this);
        bootstrap.bootstrap(function (err) {
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
            else {
                return done();
            }
        });
    };
    /**
     * Helper for system sounds
     * @check C:\Windows\Media\Garden
     * @param {string} file
     * @param {object} options
     */
    Daemon.prototype.playSystemSound = function (file, options) {
        if (options === void 0) { options = undefined; }
        return this.speaker.playFile(path.join(this.config.resourcesDir, 'system', file), options);
    };
    /**
     * Register a synchronized task
     * Example of available events: shutdown, ...
     */
    Daemon.prototype.registerTask = function (event, cb) {
        taskQueue.register(event, cb);
    };
    return Daemon;
}(events_1.EventEmitter));
exports.Daemon = Daemon;

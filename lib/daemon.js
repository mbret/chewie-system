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
var path = require("path");
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
var Daemon = (function (_super) {
    __extends(Daemon, _super);
    function Daemon() {
        var _this = _super.call(this) || this;
        global.MyBuddy = _this;
        _this.executingTasks = new Map();
        _this.hooksToLoad = [];
        _this.storage = new storage_1.default(_this);
        _this.info = {
            startedAt: new Date(),
            version: packageInfo.version,
            nodeVersions: process.versions
        };
        return _this;
    }
    Daemon.prototype.start = function (userConfig, cb) {
        if (userConfig === void 0) { userConfig = {}; }
        if (cb === void 0) { cb = function (err) { }; }
        var self = this;
        this.config = loader_1.default(userConfig);
        global.LOGGER = new Logger(self.config.log);
        var logger = LOGGER.getLogger('Daemon');
        logger.info('Start daemon');
        utils.initDirsSync([
            self.config.system.tmpDir,
            self.config.system.dataDir,
            self.config.system.pluginsTmpDir,
            path.resolve(self.config.system.dataDir, 'plugins')
        ]);
        this.logger = LOGGER.getLogger('Daemon');
        this.logger.Logger = LOGGER;
        this.logger.getLogger = LOGGER.getLogger.bind(LOGGER);
        this.logger.info('Starting...');
        this.communicationBus = new ServerCommunication.CommunicationBus(this);
        this.runtime = new runtime_1.Runtime(this);
        this.sharedApiServer = new shared_server_api_1.Server(this);
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
    Daemon.prototype.shutdown = function (processCode, restart) {
        if (processCode === void 0) { processCode = undefined; }
        if (restart === void 0) { restart = undefined; }
        if (!processCode) {
            processCode = 0;
        }
        this.emit(restart ? 'restarting' : 'shutdown');
        this.logger.verbose('Process all registered shutdown task before shutdown');
        taskQueue.proceed('shutdown', { stopOnError: false }, function () {
            process.exit(restart ? 42 : processCode);
        });
    };
    Daemon.prototype.restart = function () {
        this.shutdown(0, true);
    };
    Daemon.prototype.init = function (cb) {
        var self = this;
        process.on('uncaughtException', function (err) {
            self.logger.error('My buddy crashed because of uncaught error. The process will be terminated :(');
            self._onUnexpectedError(err);
        });
        process.on('unhandledRejection', function (err) {
            self.logger.error('My buddy crashed because of uncaught promise error. The process will be terminated :(');
            self._onUnexpectedError(err);
        });
        process.on('SIGINT', function () {
            self.shutdown();
        });
        process.on('SIGTERM', function () {
            self.shutdown();
        });
        this.on('shutdown', function () {
            self.logger.info('The system is shutting down');
        });
        this.on('restarting', function () {
            self.logger.info('The system is restarting');
        });
        this.runBootstrap(function (err) {
            if (err) {
                errorOnStartup(err);
                return;
            }
            self.logger.info('The system is now started and ready!');
            self.logger.info('The API is available at %s or %s for remote access', self.sharedApiServer.localAddress, self.config.sharedApiUrl);
            console.log('');
            self.playSystemSound('start_up.wav');
            return cb();
        });
        function errorOnStartup(err) {
            self.logger.error("A critical error occurred during daemon startup. Process will be terminated.");
            self.logger.error(err);
            self.shutdown(1, null);
        }
    };
    Daemon.prototype._onUnexpectedError = function (error) {
        this.speaker.kill();
        this.logger.error(error);
        process.exit(1);
    };
    Daemon.prototype.runBootstrap = function (done) {
        var self = this;
        self.logger.debug("Run system bootstrap...");
        var bootstrap = new bootstrap_1.Bootstrap(this);
        bootstrap.bootstrap(function (err) {
            if (err) {
                return done(err);
            }
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
    Daemon.prototype.playSystemSound = function (file, options) {
        if (options === void 0) { options = undefined; }
        return this.speaker.playFile(path.join(this.config.resourcesDir, 'system', file), options);
    };
    Daemon.prototype.registerTask = function (event, cb) {
        taskQueue.register(event, cb);
    };
    return Daemon;
}(events_1.EventEmitter));
exports.Daemon = Daemon;

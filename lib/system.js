'use strict';
let async = require('async');
let taskQueue = require('my-buddy-lib').taskQueue;
let repositories = require('./core/repositories');
let utils = require('my-buddy-lib').utils;
const path = require('path');
let packageInfo = require(__dirname + '/../package.json');
let Logger = require('my-buddy-lib').logger.Logger;
const events_1 = require("events");
const ServerCommunication = require("./core/server-communication/index");
const scenario_reader_1 = require("./core/scenario/scenario-reader");
const module_loader_1 = require("./core/plugins/modules/module-loader");
const bootstrap_1 = require("./bootstrap");
const runtime_1 = require("./core/runtime");
const shared_server_api_1 = require("./shared-server-api");
const plugins_loader_1 = require("./core/plugins/plugins-loader");
const speaker_1 = require("./core/speaker/speaker");
const loader_1 = require("./configuration/loader");
const local_1 = require("./core/repositories/local");
const storage_1 = require("./core/storage/storage");
const helper_1 = require("./core/remote-service/helper");
class System extends events_1.EventEmitter {
    constructor() {
        super();
        this.info = {
            startedAt: new Date(),
            version: packageInfo.version,
            nodeVersions: process.versions
        };
    }
    start(userConfig = {}, cb = function (err) { }) {
        let self = this;
        this.config = loader_1.default(userConfig);
        let LOGGER = new Logger(self.config.log);
        this.logger = LOGGER.getLogger('System');
        this.logger.info('Start daemon');
        utils.initDirsSync([
            self.config.system.tmpDir,
            self.config.system.dataDir,
            self.config.system.pluginsTmpDir,
            path.resolve(self.config.system.dataDir, 'plugins')
        ]);
        this.logger.Logger = LOGGER;
        this.logger.getLogger = LOGGER.getLogger.bind(LOGGER);
        this.logger.info('Starting...');
        this.storage = new storage_1.default(this);
        this.communicationBus = new ServerCommunication.CommunicationBus(this);
        this.runtime = new runtime_1.Runtime(this);
        this.sharedApiServer = new shared_server_api_1.Server(this);
        this.apiService = new helper_1.default(this);
        this.speaker = new speaker_1.Speaker(this);
        this.localRepository = new local_1.default(this);
        this.repository = new repositories.Repository(this);
        this.scenarioReader = new scenario_reader_1.ScenarioReader(this);
        this.moduleLoader = new module_loader_1.ModuleLoader(this);
        this.pluginsLoader = new plugins_loader_1.PluginsLoader(this);
        this.init(function (err) {
            return cb(err);
        });
    }
    shutdown(processCode = undefined, restart = undefined) {
        if (!processCode) {
            processCode = 0;
        }
        this.emit(restart ? 'restarting' : 'shutdown');
        this.logger.verbose('Process all registered shutdown task before shutdown');
        taskQueue.proceed('shutdown', { stopOnError: false }, function () {
            process.exit(restart ? 42 : processCode);
        });
    }
    restart() {
        this.shutdown(0, true);
    }
    init(cb) {
        let self = this;
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
            self.logger.verbose('The API is available at %s or %s for remote access', self.sharedApiServer.localAddress, self.config.sharedApiUrl);
            self.logger.info('=====================================');
            self.logger.info('                                     ');
            self.logger.info('The system is now started and ready! ');
            self.logger.info('                                     ');
            self.logger.info('=====================================');
            console.log('');
            self.playSystemSound('start_up.wav');
            return cb();
        });
        function errorOnStartup(err) {
            self.logger.error("A critical error occurred during daemon startup. Process will be terminated.");
            self.logger.error(err);
            self.shutdown(1, null);
        }
    }
    _onUnexpectedError(error) {
        this.speaker.kill();
        this.logger.error(error);
        process.exit(1);
    }
    runBootstrap(done) {
        let self = this;
        self.logger.debug("Run system bootstrap...");
        let bootstrap = new bootstrap_1.Bootstrap(this);
        bootstrap.bootstrap(function (err) {
            if (err) {
                return done(err);
            }
            let UserBootstrapModule = self.config.bootstrap || null;
            if (UserBootstrapModule) {
                let initializing = true;
                self.logger.debug("A user bootstrap has been found, run it");
                let userBootstrap = new UserBootstrapModule();
                userBootstrap.bootstrap(self, function (err) {
                    initializing = false;
                    return done(err);
                });
                setTimeout(function () {
                    if (initializing) {
                        self.logger.warn("The user bootstrap seems to take an unusual long time. For some cases you may increase the time in config file.");
                    }
                }, 6000);
            }
            else {
                return done();
            }
        });
    }
    playSystemSound(file, options = undefined) {
        return this.speaker.playFile(path.join(this.config.resourcesDir, 'system', file), options);
    }
    registerTask(event, cb) {
        taskQueue.register(event, cb);
    }
}
exports.System = System;

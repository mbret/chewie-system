"use strict";
let async = require('async');
const util = require("util");
let taskQueue = require('my-buddy-lib').taskQueue;
let repositories = require('./core/repositories');
let utils = require('my-buddy-lib').utils;
const path = require("path");
let packageInfo = require(__dirname + '/../package.json');
const events_1 = require("events");
const ServerCommunication = require("./core/server-communication/index");
const scenario_reader_1 = require("./core/scenario/scenario-reader");
const module_loader_1 = require("./core/plugins/modules/module-loader");
const bootstrap_1 = require("./bootstrap");
const runtime_1 = require("./core/runtime");
const plugins_loader_1 = require("./core/plugins/plugins-loader");
const speaker_1 = require("./core/speaker/speaker");
const loader_1 = require("./configuration/loader");
const local_1 = require("./core/repositories/local");
const storage_1 = require("./core/storage/storage");
const shared_api_service_helper_1 = require("./core/remote-service/shared-api-service-helper");
const logger_1 = require("./core/logger");
class System extends events_1.EventEmitter {
    constructor(info) {
        super();
        this.id = info.id;
        this.name = info.name;
        this.hooks = [];
        this.info = {
            startedAt: new Date(),
            version: packageInfo.version,
            nodeVersions: process.versions
        };
    }
    start(options = {}, cb = function (err) { }) {
        let self = this;
        loader_1.default(options.settings)
            .then(function (config) {
            self.config = config;
            let loggerBuilder = new logger_1.LoggerBuilder(self.config.log);
            self.logger = loggerBuilder.getLogger('System');
            self.logger.info(self.logger.emoji.get("point_up") + ' Start daemon');
            utils.initDirsSync([
                self.config.system.tmpDir,
                self.config.system.appDataPath,
                self.config.system.pluginsTmpDir,
                self.config.pluginsLocalRepositoryDir,
            ]);
            self.logger.verbose("App data path is located to %s (resolved)", path.resolve(process.cwd(), self.config.system.appDataPath));
            self.logger.info(self.logger.emoji.get("coffee") + ' Starting...');
            self.storage = new storage_1.default(self);
            self.communicationBus = new ServerCommunication.CommunicationBus(self);
            self.runtime = new runtime_1.Runtime(self);
            self.sharedApiService = new shared_api_service_helper_1.SharedApiServiceHelper(self);
            self.speaker = new speaker_1.Speaker(self);
            self.localRepository = new local_1.default(self);
            self.repository = new repositories.Repository(self);
            self.scenarioReader = new scenario_reader_1.ScenarioReader(self);
            self.moduleLoader = new module_loader_1.ModuleLoader(self);
            self.pluginsLoader = new plugins_loader_1.PluginsLoader(self);
            self.init(function (err) {
                return cb(err);
            });
        })
            .catch(function (err) {
            console.error("Unable to load configuration", err);
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
            self.logger.info('=====================================');
            self.logger.info('                                     ');
            self.logger.info('The system is now started and ready! ');
            self.logger.info('                                     ');
            self.logger.info('=====================================');
            console.log('');
            self.playSystemSound('start_up.wav');
            setTimeout(function () {
                self.sharedApiService.createNotification("System " + self.name + " started at " + self.info.startedAt + " and is now ready")
                    .catch(errorOnStartup);
            }, 2000);
            self.emit("ready");
            return cb();
        });
        function errorOnStartup(err) {
            self.logger.error("A critical error occurred during daemon startup. Process will be terminated.", util.inspect(err, true));
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
            let userBootstrap = self.config.bootstrap ? require(path.resolve(process.cwd(), self.config.bootstrap)) : null;
            if (userBootstrap && userBootstrap.bootstrap) {
                let initializing = true;
                self.logger.debug("A user bootstrap has been found, run it");
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
}
exports.System = System;
//# sourceMappingURL=system.js.map
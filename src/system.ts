"use strict";

let async = require('async');
import _  = require('lodash');
const util = require("util");
let repositories = require('./core/repositories');
let utils = require('my-buddy-lib').utils;
import path = require('path');
let queue = require('queue');
let packageInfo = require(__dirname + '/../package.json');
import ip  = require('ip');
import {EventEmitter}  from "events";
import * as ServerCommunication from "./core/server-communication/index";
import {ScenarioReader} from "./core/scenario/scenario-reader";
import {ModuleLoader} from "./core/plugins/modules/module-loader";
import {Bootstrap} from "./bootstrap";
import {Speaker} from "./core/speaker/speaker";
import configurationLoader from "./configuration/loader";
import LocalRepository from "./core/repositories/local-repository";
import Storage from "./core/storage/storage";
import {SharedApiServiceHelper} from "./core/remote-service/shared-api-service-helper";
import {LoggerBuilder, LoggerInterface} from "./core/logger";
import {HookInterface} from "./core/hook-interface";
import {GarbageCollector} from "./core/garbage-collector";
import {PluginContainer} from "./core/plugins/plugin-container";
import {ModuleContainer} from "./core/plugins/modules/module-container";
import {PluginsHelper} from "./core/plugins/plugins-helper";
import {debug} from "./shared/debug";
import {RepositoriesHelper} from "./core/repositories/repositories-helper";
import SharedServerApiHook from "./core/shared-server-api/lib/server";
import EmailAdapterContainer from "./core/email/email-adapter-container";

/**
 * System is the main program daemon.
 * This daemon stay alive as long as the program is not shut down.
 */
export class System extends EventEmitter {

    // static config (available at system creation)
    config: any;
    // dynamic config (available after api ready)
    userOptions: any;
    communicationBus: ServerCommunication.CommunicationBus;
    scenarioReader: ScenarioReader;
    moduleLoader: ModuleLoader;
    logger: LoggerInterface;
    speaker: Speaker;
    localRepository: LocalRepository;
    garbageCollector: GarbageCollector;
    repository: any;
    sharedApiService: SharedApiServiceHelper;
    storage: Storage;
    hooks: Array<HookInterface>;
    plugins: Map<string, PluginContainer>;
    modules: Map<string, ModuleContainer>;
    info: any;
    shuttingDown: boolean;
    id: string;
    name: string;
    email: EmailAdapterContainer;
    sharedApiServer: SharedServerApiHook;
    public pluginsHelper: PluginsHelper;
    public repositoriesHelper: RepositoriesHelper;
    protected shutdownQueue: any;

    /**
     * System constructor
     */
    constructor(info) {
        super();
        this.id = info.id;
        this.name = info.name;
        this.shuttingDown = false;
        this.hooks = [];
        this.info = {
            startedAt: new Date(),
            version: packageInfo.version,
            nodeVersions: process.versions
        };
        this.plugins = new Map();
        this.modules = new Map();
        this.shutdownQueue = queue();
        this.garbageCollector = new GarbageCollector(this);
        this.pluginsHelper = new PluginsHelper(this);
        this.repositoriesHelper = new RepositoriesHelper(this);
        this.email = new EmailAdapterContainer(this);
    }

    /**
     * Application entry point.
     * @param options
     * @param cb
     * @constructor
     */
    public start(options: any = {}, cb = function(err){}){
        let self = this;

        // load config
        configurationLoader(options.settings)
            .then(function(config) {
                self.config = config;

                // Build system logger
                let loggerBuilder = new LoggerBuilder(self.config.log);
                self.logger = loggerBuilder.getLogger('System');

                // self.logger.debug("%s %s %s", "foo", {"damn": "gens"});
                // process.exit();
                self.logger.info(self.logger.emoji.get("point_up") + ' Start daemon');

                // init required folders
                utils.initDirsSync([
                    self.config.system.tmpDir,
                    self.config.system.appDataPath,
                    self.config.system.pluginsTmpDir,
                    self.config.pluginsLocalRepositoryDir,
                ]);

                // log various paths for debug conveniences
                self.logger.verbose("App data path is located to %s (resolved)", path.resolve(process.cwd(), self.config.system.appDataPath));
                self.logger.verbose("App tmp folder is located to %s (resolved)", path.resolve(self.config.system.tmpDir));

                // self.logger.Logger = loggerBuilder;
                self.logger.info(self.logger.emoji.get("coffee") + ' Starting...');
                self.storage = new Storage(self);
                self.communicationBus = new ServerCommunication.CommunicationBus(self);
                // self.runtime = new Runtime(self);
                self.sharedApiService = new SharedApiServiceHelper(self);
                self.speaker = new Speaker(self);
                self.localRepository = new LocalRepository(self);
                self.repository = new repositories.Repository(self);
                self.scenarioReader = new ScenarioReader(self);
                self.moduleLoader = new ModuleLoader(self);
                self.sharedApiServer = new SharedServerApiHook(self);

                self.init(function(err){
                    return cb(err);
                });
            })
            .catch(function(err) {
                console.error("Unable to load configuration", err);
                return cb(err);
            });
    }

    /**
     * @param processCode null|0 by default
     * @param restart
     */
    public shutdown(processCode = undefined, restart = undefined) {
        let self = this;

        if (self.shuttingDown) {
            return;
        }

        self.shuttingDown = true;
        if (!processCode) {
            processCode = 0; // no problem
        }

        this.emit(restart ? 'restarting' : 'shutdown');

        // Process each task on shutdown
        this.logger.verbose('Process all registered shutdown task before shutdown');
        this.shutdownQueue.start(function(err) {
            // ignore error
            if (err) {
                self.logger.error("Some errors on shutdown task queue processing", err);
            }
            process.exit(restart ? 42 : processCode);
        });
    }

    public restart(){
        this.shutdown(0, true);
    }

    public registerTaskOnShutdown(fn: Function) {
        this.shutdownQueue.push(fn);
    }

    private init(cb) {
        let self = this;

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

        this.runBootstrap(function(err){
            if(err){
                errorOnStartup(err);
                return;
            }

            // Splash final information
            self.logger.info('=====================================');
            self.logger.info('                                     ');
            self.logger.info('The system is now started and ready! ');
            self.logger.info('                                     ');
            self.logger.info('=====================================');

            // Play some system sounds
            self.playSystemSound('start_up.wav');

            // broadcast
            setTimeout(function(){
                self.sharedApiService.createNotification("System " + self.name + " started at " + self.info.startedAt + " and is now ready")
                    .catch(errorOnStartup)
            }, 2000);

            self.emit("ready");

            return cb();
        });

        function errorOnStartup(err) {
            self.logger.error("A critical error occurred during daemon startup. Process will be terminated.", util.inspect(err, true));
            self.shutdown(1, null);
        }
    }

    private _onUnexpectedError(error){
        // kill speaker to avoid having phantom sounds if system crash
        this.speaker.kill();
        this.logger.error(util.inspect(error));
        process.exit(1);
    }

    /**
     * Run the core bootstrap then the user bootstrap if it exist.
     * @param done
     */
    private runBootstrap(done) {
        let self = this;

        // run core bootstrap
        self.logger.debug("Run system bootstrap...");
        let bootstrap = new Bootstrap(this);
        bootstrap.bootstrap(function(err) {
            if (err) {
                return done(err);
            }

            // run user bootstrap if exist
            // bootstrap key is a string and we suppose is relative to correct file.
            // as require is always relative to the file containing the call we need to resolve from cwd
            debug("system")("Try to lookup user bootstrap");
            let userBootstrap: any = null;
            if (_.isString(self.config.bootstrap)) {
                userBootstrap = require(path.resolve(process.cwd(), self.config.bootstrap));
            } else if (_.isObject(self.config.bootstrap)) {
                userBootstrap = self.config.bootstrap;
            }
            // handle bootstrap: function(){} and not bootstrap: {bootstrap: function(){} }
            if (typeof userBootstrap === "function") {
                userBootstrap.bootstrap = userBootstrap;
            }
            if (userBootstrap && userBootstrap.bootstrap) {
                let initializing = true;
                self.logger.debug("A user bootstrap has been found, run it");
                userBootstrap.bootstrap(self, function(err) {
                    initializing = false;
                    return done(err);
                });

                // Warning for abnormal time
                setTimeout(function() {
                    if (initializing) {
                        self.logger.warn("The user bootstrap seems to take an unusual long time. For some cases you may increase the time in config file.");
                    }
                }, 6000);
            } else {
                debug("system")("No user bootstrap found!");
                return done();
            }
        });
    }

    /**
     * Helper for system sounds
     * @check C:\Windows\Media\Garden
     * @param {string} file
     * @param {object} options
     */
    protected playSystemSound(file: string, options: any = undefined){
        return this.speaker.playFile(this.config.resourcesDir + "/system/" + file, options);
    }
}

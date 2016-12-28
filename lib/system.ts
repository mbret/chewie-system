'use strict';

let async = require('async');
import _  = require('lodash');
let taskQueue = require('my-buddy-lib').taskQueue;
let repositories = require('./core/repositories');
let utils = require('my-buddy-lib').utils;
import path = require('path');
let packageInfo = require(__dirname + '/../package.json');
let Logger = require('my-buddy-lib').logger.Logger;
import ip  = require('ip');
import { EventEmitter }  from "events";
import * as ServerCommunication from "./core/server-communication/index";
import {ScenarioReader} from "./core/scenario/scenario-reader";
import {ModuleLoader} from "./core/plugins/modules/module-loader";
import {Bootstrap} from "./bootstrap";
import {Runtime} from "./core/runtime";
import {PluginsLoader} from "./core/plugins/plugins-loader";
import {Speaker} from "./core/speaker/speaker";
import configurationLoader from "./configuration/loader";
import LocalRepository from "./core/repositories/local";
import Storage from "./core/storage/storage";
import {SharedApiServiceHelper} from "./core/remote-service/shared-api-service-helper";

/**
 * System is the main program daemon.
 * This daemon stay alive as long as the program is not shut down.
 */
export class System extends EventEmitter {

    runtime: Runtime;
    config: any;
    communicationBus: ServerCommunication.CommunicationBus;
    scenarioReader: ScenarioReader;
    moduleLoader: ModuleLoader;
    pluginsLoader: PluginsLoader;
    logger: any;
    speaker: Speaker;
    localRepository: LocalRepository;
    repository: any;
    sharedApiService: SharedApiServiceHelper;
    storage: Storage;
    info: any;
    id: string;
    name: string;

    /**
     * System constructor
     */
    constructor(info) {
        super();
        this.id = info.id;
        this.name = info.name;
        this.info = {
            startedAt: new Date(),
            version: packageInfo.version,
            nodeVersions: process.versions
        };
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
        this.config = configurationLoader(require(options.settings));

        // Build system logger
        let LOGGER = new Logger(self.config.log);
        this.logger = LOGGER.getLogger('System');

        this.logger.info('Start daemon');

        // init required folders
        utils.initDirsSync([
            self.config.system.tmpDir,
            self.config.system.dataDir,
            self.config.system.pluginsTmpDir,
            self.config.pluginsLocalRepositoryDir,
        ]);

        this.logger.Logger = LOGGER;
        this.logger.getLogger = LOGGER.getLogger.bind(LOGGER);
        this.logger.info('Starting...');
        this.storage = new Storage(this);
        this.communicationBus = new ServerCommunication.CommunicationBus(this);
        this.runtime = new Runtime(this);
        this.sharedApiService = new SharedApiServiceHelper(this);
        this.speaker = new Speaker(this);
        this.localRepository = new LocalRepository(this);
        this.repository = new repositories.Repository(this);
        this.scenarioReader = new ScenarioReader(this);
        this.moduleLoader = new ModuleLoader(this);
        this.pluginsLoader = new PluginsLoader(this);

        this.init(function(err){
            return cb(err);
        });
    }

    /**
     * @param processCode null|0 by default
     * @param restart
     */
    public shutdown(processCode = undefined, restart = undefined){
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

    public restart(){
        this.shutdown(0, true);
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

        // listen and forward some core events
        // this.runtimeHelper.profileManager.on("profile:start", this.emit.bind(this, "profile:start"));

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

            console.log('');

            // Play some system sounds
            self.playSystemSound('start_up.wav');
            // self.runtimeHelper.profile.on('profile:start:complete', function(){
            //     self.playSystemSound('profile_loaded.wav');
            // });

            // broadcast
            setTimeout(function(){
                self.sharedApiService.createNotification("System " + self.name + " started at " + self.info.startedAt + " and is now ready")
                    .catch(errorOnStartup)
            }, 2000);

            self.emit("ready");

            return cb();
        });

        function errorOnStartup(err) {
            self.logger.error("A critical error occurred during daemon startup. Process will be terminated.");
            self.logger.error(err);
            self.shutdown(1, null);
        }
    }

    private _onUnexpectedError(error){
        // kill speaker to avoid having phantom sounds if system crash
        this.speaker.kill();
        this.logger.error(error);
        process.exit(1);
    }

    /**
     * Run the core bootstrap then the user bootstrap if it exist.
     * @param done
     */
    private runBootstrap(done){
        let self = this;

        // run core bootstrap
        self.logger.debug("Run system bootstrap...");
        let bootstrap = new Bootstrap(this);
        bootstrap.bootstrap(function(err) {
            if (err) {
                return done(err);
            }

            // run user bootstrap if exist
            let UserBootstrapModule = self.config.bootstrap || null;
            if (UserBootstrapModule) {
                let initializing = true;
                self.logger.debug("A user bootstrap has been found, run it");
                let userBootstrap = new UserBootstrapModule();
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
    private playSystemSound(file: string, options: any = undefined){
        return this.speaker.playFile(path.join(this.config.resourcesDir, 'system', file), options);
    }

    /**
     * Register a synchronized task
     * Example of available events: shutdown, ...
     */
    private registerTask(event: string, cb: Function) {
        taskQueue.register(event, cb);
    }
}

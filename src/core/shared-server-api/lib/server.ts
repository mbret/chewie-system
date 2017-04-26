'use strict';

let app = require('express')();
let io = require('socket.io');
let https = require('https');
let http = require("http");
import * as fs from "fs-extra";
import * as _ from "lodash";
let path        = require('path');
import * as Services from "./services";
import {System} from "../../../system";
let router = require('express').Router();
let bodyParser  = require("body-parser");
let requireAll  = require('my-buddy-lib').requireAll;
import * as Sequelize from "sequelize";
let async = require("async");
let validator = require("validator");
import * as DBMigrate from "db-migrate";
import * as Bluebird from "bluebird";
import {debug} from "../../../shared/debug";
const logNamespace = "shared-server-api";
let ensureFile = Bluebird.promisify(fs.ensureFile);
let debugDefault = debug(logNamespace);
import { EventEmitter }  from "events";

export default class SharedServerApiHook extends EventEmitter {

    io: any;
    logger: any;
    server: any;
    services: any;
    system: System;
    localAddress: string;
    config: any;
    orm: any;
    app: any;

    constructor(system) {
        super();
        let self = this;
        this.logger = system.logger.getLogger(logNamespace);
        this.system = system;
        this.server = null;
        this.services = {};
        this.io = null;
        this.orm = {};
        this.app = app;

        // export system to request handler
        app.locals.system = this.system;

        // hook config
        this.config = this.system.config.sharedServerApi;
        // user did not defined storage
        if (!_.get(this.config, "sharedDatabase.connexion.storage")) {
            this.config.sharedDatabase.connexion.storage =  path.join(system.config.system.appDataPath, "storage/shared-database.db");
        }
        // runtime config
        this.config.storageDir = path.dirname(this.config.sharedDatabase.connexion.storage);

        // Include all services
        _.forEach(Services, function(module, key) {
            self.services[key.charAt(0).toLowerCase() + key.slice(1)] = new module(self);
        });

        // log various paths for debug conveniences
        debugDefault("Storage file is located to %s", this.config.sharedDatabase.connexion.storage);
    }

    public initialize() {
        let self = this;

        return Promise.resolve()
            // first we ensure storage file exist
            .then(function() {
                return ensureFile(self.config.sharedDatabase.connexion.storage);
            })
            // then we run migration (from database creation to last update)
            .then(function() {
                return self.runMigration();
            })
            // then configure orm that is used across the app
            .then(function() {
                return self.configureOrm();
            })
            // app.use(..)
            .then(function() {
                return self.configureMiddleware(app);
            })
            // start the server
            .then(function() {
                return self.startServer().then(function(){
                    self.services.eventsWatcher.watch();
                    debugDefault('Initialized');
                    return Promise.resolve();
                });
            });
    }

    protected startServer() {
        let self = this;
        let port = self.config.port;

        // use ssl ?
        if (this.config.ssl.activate) {
            let privateKey = fs.readFileSync(this.config.ssl.key, 'utf8');
            let certificate = fs.readFileSync(this.config.ssl.cert, 'utf8');
            this.server = https.createServer({key: privateKey, cert: certificate}, app);
        } else {
            this.server = http.createServer(app);
        }

        self.server.listen(port);

        this.io = io(self.server, {});
        require('./socket')(self, this.io);

        return new Promise(function(resolve, reject) {
            self.server
                .on('error', function(error){
                    if (error.syscall !== 'listen') {
                        throw error;
                    }

                    // handle specific listen errors with friendly messages
                    switch (error.code) {
                        case 'EADDRINUSE':
                            self.logger.error("It seems that something is already running on port %s. The api server will not be able to start. Maybe a chewie app is already started ?", port);
                            break;
                        default:
                            break;
                    }
                    return reject(error);
                })
                .on('listening', function(){
                    self.localAddress = 'https://localhost:' + self.server.address().port;
                    debugDefault(`The API is available at ${self.localAddress} or ${self.system.config.sharedApiUrl} for remote access`);
                    return resolve();
                });
        });
    }

    protected runMigration() {
        let server = this;
        debugDefault("Run database migration...");
        let dbMigrateInstance = DBMigrate.getInstance(true, {
            cwd: server.config.sharedDatabase.migrationDir,
            config: {
                dev: {
                    driver: "sqlite3",
                    filename: path.resolve(process.cwd(), server.config.sharedDatabase.connexion.storage),
                }
            },
            env: "dev"
        });
        dbMigrateInstance.silence(!server.config.sharedDatabase.migrationLogs);
        return dbMigrateInstance.up()
            .then(function() {
                debugDefault("Database migration executed with success");
            })
            .catch(function(err) {
                server.logger.error("Database migration failed: ", err.message);
                throw err;
            });
    }

    /**
     * Orm initialization
     * - create orm
     * - create and attach models
     * - create tables
     * - init admin user
     */
    protected configureOrm() {
        let server = this;
        debugDefault("Configure ORM...");
        server.orm.sequelize = new Sequelize('database', 'admin', null, this.config.sharedDatabase.connexion);

        let modelsPath = "./models";

        // Define models
        server.orm.models = {};
        server.orm.models.Logs = require(modelsPath + '/logs')(server.orm.sequelize, server);
        server.orm.models.User = require(modelsPath + '/user')(server.orm.sequelize, server);
        server.orm.models.Plugins = require(modelsPath + '/plugins')(server.orm.sequelize, server);
        server.orm.models.Task = require(modelsPath + '/task')(server.orm.sequelize, server);
        server.orm.models.Scenario = require(modelsPath + '/scenario')(server.orm.sequelize, server);
        server.orm.models.Notification = require(modelsPath + '/notification')(server.orm.sequelize, server);
        server.orm.models.HookData = require(modelsPath + '/hook-data').define(server.orm.sequelize, server);
        server.orm.models.HookOption = require(modelsPath + '/hook-option').define(server.orm.sequelize, server);
        server.orm.models.SystemConfig = require(modelsPath + '/system-config').define(server.orm.sequelize, server);

        // server.orm.models.User.hasMany(server.orm.models.Plugins);
        server.orm.models.User.hasMany(server.orm.models.Task);
        // server.orm.models.User.hasMany(server.orm.models.Scenario);

        // User 0 -> n Notification
        // server.orm.models.User.hasMany(server.orm.models.Notification);
        // server.orm.models.Plugins.hasMany(server.orm.models.Task);

        // server.orm.models.Plugins.belongsTo(server.orm.models.User);
        // server.orm.models.Task.belongsTo(server.orm.models.User);
        // server.orm.models.Task.belongsTo(server.orm.models.Plugins);
        // server.orm.models.Scenario.belongsTo(server.orm.models.User);
        // server.orm.models.Notification.belongsTo(server.orm.models.User);

        server.orm.models.Plugins.hook('afterUpdate', function(plugin, options){
            server.emit('orm:plugins:updated', plugin);
        });

        server.orm.models.User.hook('afterUpdate', function(user, options){
            server.emit('orm:user:updated', user);
        });

        // By default there is always one user. The administrator
        return server.orm.models.User
            .initAdmin()
            .then(function() {
                debugDefault("ORM initialized");
            });
    }

    protected configureMiddleware(app) {
        let self = this;
        let server = this;
        app.use(bodyParser.json()); // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
            extended: true
        }));

        app.use(function allowCrossDomain(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Credentials", "true");
            next();
        });

        // logging http
        app.use(function (req, res, next) {
            self.logger.verbose(`[${req.hostname } (${req.protocol})] "${req.method} ${req.url} ${req.headers['user-agent'] || '(no user-agent)'}"`);
            return next();
        });

        app.use(function(req, res, next){
            res.set("chewie-version", self.system.info.version);

            /**
             * 400
             * @param err
             * @param options
             */
            res.badRequest = function(err, options = {}) {
                let message = "Bad request";
                let error = {};
                if(_.isString(err)) {
                    message = err;
                    err = {};
                }
                let errResponse = {
                    status: "error",
                    code: err.code || "badRequest",
                    message: err.message || message,
                    data: err.data || {}
                };

                return res.status(400).send(errResponse);
            };

            res.created = function(data){
                return res.status(201).send(data);
            };

            res.ok = function(data){
                return res.status(200).send(data);
            };

            res.notFound = function(data){
                let errResponse: any = {};
                errResponse.status = "error";
                errResponse.code = "notFound";
                errResponse.message = data;
                errResponse.data = {};
                return res.status(404).send(errResponse);
            };

            res.updated = function(data){
                return res.status(200).send(data);
            };

            /**
             * http://jsonapi.org/format/#errors-processing
             * https://labs.omniti.com/labs/jsend
             * @param err
             * @returns {*}
             */
            res.serverError = function(err) {
                server.logger.error("Send 500 response", err);
                return serverError(res, err);
            };

            return next();
        });

        // Require all controllers
        requireAll({
            dirname: __dirname + '/controllers',
            recursive: true,
            resolve: function(controller){
                controller(server, router);
            }
        });

        app.use('/', router); // @deprecated
        app.use('/api', router);

        // Error handler
        app.use(function(err, req, res, next) {
            server.logger.error("An error has been thrown inside middleware and has been catch by 500 error handle: " + err.stack);
            return serverError(res, err);
        });

        // extend validator module with some custom test
        validator.isModuleId = function(value) {
            return this.matches(value, /\w+:\w+/);
        };
        validator.isUsername = function(value) {
            return this.isAlpha(value);
        };

        function serverError(res, err: any){
            let errResponse: any = {};
            errResponse.status = "error";
            errResponse.code = "serverError";
            errResponse.message = "An internal error occured";
            errResponse.data = {};

            // Handle Error object
            if(err instanceof Error) {
                let error: any = err; // workaround for 'code' property
                errResponse = _.merge(errResponse, {message: error.message, data: {stack: error.stack, code: error.code}});
            }

            if(_.isString(err)) {
                errResponse.message = err;
            }

            return res.status(500).send(errResponse)
        }

        return Promise.resolve();
    }
}
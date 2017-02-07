'use strict';
let app = require('express')();
let io = require('socket.io');
let https = require('https');
let http = require("http");
let fs = require('fs');
const _ = require("lodash");
let path = require('path');
let localConfig = require("../hook-config");
const Services = require("./services");
const hook_interface_1 = require("../../../core/hook-interface");
let router = require('express').Router();
let bodyParser = require("body-parser");
let requireAll = require('my-buddy-lib').requireAll;
const Sequelize = require("sequelize");
let async = require("async");
let validator = require("validator");
const fsExtra = require("fs-extra");
const DBMigrate = require("db-migrate");
const Bluebird = require("bluebird");
let ensureFile = Bluebird.promisify(fsExtra.ensureFile);
class SharedServerApiHook extends hook_interface_1.Hook {
    constructor(system, userHookConfig) {
        super(system, userHookConfig);
        let self = this;
        this.logger = system.logger.getLogger('SharedServerApiHook');
        this.config = _.merge(localConfig, {
            storageFilePath: path.join(system.config.system.appDataPath, "storage", localConfig.storageFileName)
        }, userHookConfig);
        this.system = system;
        this.server = null;
        this.services = {};
        this.io = null;
        this.orm = {};
        app.locals.system = this.system;
        _.forEach(Services, function (module, key) {
            self.services[key.charAt(0).toLowerCase() + key.slice(1)] = new module(self);
        });
        self.logger.verbose("Storage file is located to %s", self.config.storageFilePath);
    }
    initialize() {
        let self = this;
        return Promise.resolve()
            .then(function () {
            return ensureFile(self.config.storageFilePath);
        })
            .then(function () {
            return self.runMigration();
        })
            .then(function () {
            return self.configureOrm();
        })
            .then(function () {
            return self.configureMiddleware(app);
        })
            .then(function () {
            return self.startServer().then(function () {
                self.services.eventsWatcher.watch();
                self.logger.verbose('Initialized');
                return Promise.resolve();
            });
        });
    }
    startServer() {
        let self = this;
        let port = self.config.port;
        if (this.config.ssl.activate) {
            let privateKey = fs.readFileSync(this.config.ssl.key, 'utf8');
            let certificate = fs.readFileSync(this.config.ssl.cert, 'utf8');
            this.server = https.createServer({ key: privateKey, cert: certificate }, app);
        }
        else {
            this.server = http.createServer(app);
        }
        self.server.listen(port);
        this.io = io(self.server, {});
        require('./socket')(self, this.io);
        return new Promise(function (resolve, reject) {
            self.server
                .on('error', function (error) {
                if (error.syscall !== 'listen') {
                    throw error;
                }
                switch (error.code) {
                    case 'EADDRINUSE':
                        self.logger.error("It seems that something is already running on port %s. The web server will not be able to start. Maybe a chewie app is already started ?", port);
                        break;
                    default:
                        break;
                }
                return reject(error);
            })
                .on('listening', function () {
                self.localAddress = 'https://localhost:' + self.server.address().port;
                self.logger.verbose('The API is available at %s or %s for remote access', self.localAddress, self.system.config.sharedApiUrl);
                return resolve();
            });
        });
    }
    runMigration() {
        let server = this;
        server.logger.verbose("Run database migration");
        let dbMigrateInstance = DBMigrate.getInstance(true, {
            cwd: server.config.sharedDatabase.migrationDir,
            config: {
                dev: {
                    driver: "sqlite3",
                    filename: path.resolve(process.cwd(), server.config.storageFilePath),
                }
            },
            env: "dev"
        });
        dbMigrateInstance.silence(!server.config.sharedDatabase.migrationLogs);
        return dbMigrateInstance.up()
            .then(function () {
            server.logger.verbose("Database migration executed with success");
        })
            .catch(function (err) {
            server.logger.error("runMigration failed");
            throw err;
        });
    }
    configureOrm() {
        let server = this;
        server.orm.sequelize = new Sequelize('database', 'admin', null, _.merge(server.config.sharedDatabase.connexion, {
            storage: server.config.storageFilePath
        }));
        let modelsPath = "./models";
        server.orm.models = {};
        server.orm.models.Logs = require(modelsPath + '/logs')(server.orm.sequelize, server);
        server.orm.models.User = require(modelsPath + '/user')(server.orm.sequelize, server);
        server.orm.models.Plugins = require(modelsPath + '/plugins')(server.orm.sequelize, server);
        server.orm.models.Task = require(modelsPath + '/task')(server.orm.sequelize, server);
        server.orm.models.Scenario = require(modelsPath + '/scenario')(server.orm.sequelize, server);
        server.orm.models.Notification = require(modelsPath + '/notification')(server.orm.sequelize, server);
        server.orm.models.User.hasMany(server.orm.models.Task);
        server.orm.models.Plugins.hook('afterUpdate', function (plugin, options) {
            server.emit('orm:plugins:updated', plugin);
        });
        server.orm.models.User.hook('afterUpdate', function (user, options) {
            server.emit('orm:user:updated', user);
        });
        return server.orm.models.User
            .initAdmin()
            .then(function () {
            server.logger.verbose("ORM initialized");
        });
    }
    configureMiddleware(app) {
        let server = this;
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(function allowCrossDomain(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Credentials", "true");
            next();
        });
        app.use(function (req, res, next) {
            server.logger.debug(req.hostname + " -> " + req.method + " (" + req.protocol + ") " + req.url);
            return next();
        });
        app.use(function (req, res, next) {
            res.badRequest = function (err, options = {}) {
                let message = "Bad request";
                let error = {};
                if (_.isString(err)) {
                    message = err;
                }
                let errResponse = {
                    status: "error",
                    code: "badRequest",
                    message: message,
                    data: err
                };
                return res.status(400).send(errResponse);
            };
            res.created = function (data) {
                return res.status(201).send(data);
            };
            res.ok = function (data) {
                return res.status(200).send(data);
            };
            res.notFound = function (data) {
                let errResponse = {};
                errResponse.status = "error";
                errResponse.code = "notFound";
                errResponse.message = data;
                errResponse.data = {};
                return res.status(404).send(errResponse);
            };
            res.updated = function (data) {
                return res.status(200).send(data);
            };
            res.serverError = function (err) {
                server.logger.error("Send 500 response", err);
                return serverError(res, err);
            };
            return next();
        });
        requireAll({
            dirname: __dirname + '/controllers',
            recursive: true,
            resolve: function (controller) {
                controller(server, router);
            }
        });
        app.use('/', router);
        app.use('/api', router);
        app.use(function (err, req, res, next) {
            server.logger.error("An error has been thrown inside middleware and has been catch by 500 error handle: " + err.stack);
            return serverError(res, err);
        });
        validator.isModuleId = function (value) {
            return this.matches(value, /\w+:\w+/);
        };
        validator.isUsername = function (value) {
            return this.isAlpha(value);
        };
        function serverError(res, err) {
            let errResponse = {};
            errResponse.status = "error";
            errResponse.code = "serverError";
            errResponse.message = "An internal error occured";
            errResponse.data = {};
            if (err instanceof Error) {
                let error = err;
                errResponse = _.merge(errResponse, { message: error.message, data: { stack: error.stack, code: error.code } });
            }
            if (_.isString(err)) {
                errResponse.message = err;
            }
            return res.status(500).send(errResponse);
        }
        return Promise.resolve();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SharedServerApiHook;
//# sourceMappingURL=server.js.map
"use strict";
let router = require('express').Router();
let _ = require('lodash');
let bodyParser = require("body-parser");
let utils = require('my-buddy-lib').utils;
let requireAll = require('my-buddy-lib').requireAll;
let Sequelize = require('sequelize');
let async = require("async");
let validator = require("validator");
let path = require("path");
const fsExtra = require("fs-extra");
const DBMigrate = require("db-migrate");
const bluebird = require("bluebird");
let ensureFile = bluebird.promisify(fsExtra.ensureFile);
module.exports = function (server, app) {
    return Promise.resolve()
        .then(function () {
        return ensureFile(server.config.sharedDatabase.connexion.storage);
    })
        .then(function () {
        return runMigration(server);
    })
        .then(function () {
        return configureOrm(server);
    })
        .then(function () {
        return new Promise(function (resolve, reject) {
            async.series([
                function (done) {
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
                    try {
                        requireAll({
                            dirname: __dirname + '/controllers',
                            recursive: true,
                            resolve: function (controller) {
                                controller(server, router);
                            }
                        });
                    }
                    catch (err) {
                        return done(err);
                    }
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
                    return done();
                    function serverError(res, err) {
                        let errResponse = {};
                        errResponse.status = "error";
                        errResponse.code = "serverError";
                        errResponse.message = "An internal error occured";
                        errResponse.data = {};
                        if (err instanceof Error) {
                            errResponse = _.merge(errResponse, { message: err.message, data: { stack: err.stack, code: err.code } });
                        }
                        if (_.isString(err)) {
                            errResponse.message = err;
                        }
                        return res.status(500).send(errResponse);
                    }
                }
            ], function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    });
};
function runMigration(server) {
    server.logger.verbose("Run database migration");
    let dbMigrateInstance = DBMigrate.getInstance(true, {
        cwd: server.config.sharedDatabase.migrationDir,
        config: {
            dev: {
                driver: "sqlite3",
                filename: server.config.sharedDatabase.connexion.storage,
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
function configureOrm(server) {
    server.orm = {};
    server.orm.sequelize = new Sequelize('database', 'admin', null, server.config.sharedDatabase.connexion);
    let modelsPath = "./models";
    utils.initDirsSync(path.dirname(server.config.sharedDatabase.connexion.storage));
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
    server.logger.verbose("Synchronizing ORM");
    return Promise
        .all([])
        .then(function () {
        server.logger.verbose("ORM initialized");
        return server.orm.models.User.initAdmin();
    });
}

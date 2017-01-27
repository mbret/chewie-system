"use strict";
let router      = require('express').Router();
let _           = require('lodash');
let bodyParser  = require("body-parser");
let utils       = require('my-buddy-lib').utils;
let requireAll  = require('my-buddy-lib').requireAll;
// let WinstonTransportSequelize = require('my-buddy-lib').WinstonTransportSequelize;
let Sequelize = require('sequelize');
let async = require("async");
let validator = require("validator");
let path = require("path");
import * as fsExtra from "fs-extra";
import * as DBMigrate from "db-migrate";
import * as bluebird from "bluebird";
let ensureFile = bluebird.promisify(fsExtra.ensureFile);

module.exports = function(server, app){

    return Promise.resolve()
        // first we ensure storage file exist
        .then(function() {
            return ensureFile(server.config.sharedDatabase.connexion.storage);
        })
        // then we run migration (from database creation to last update)
        .then(function() {
            return runMigration(server);
        })
        // then configure orm that is used across the app
        .then(function() {
            return configureOrm(server);
        })
        .then(function() {
            return new Promise(function(resolve, reject) {
                async.series([
                    function(done) {
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
                        // simple log of http request
                        // Only in console, nginx take control on production environment
                        app.use(function (req, res, next) {
                            server.logger.debug(req.hostname + " -> " + req.method + " (" + req.protocol + ") " + req.url);
                            return next();
                        });

                        app.use(function(req, res, next){

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
                                }
                                let errResponse = {
                                    status: "error",
                                    code: "badRequest",
                                    message: message,
                                    data: err
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
                                let errResponse = {};
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
                        try {
                            requireAll({
                                dirname: __dirname + '/controllers',
                                recursive: true,
                                resolve: function(controller){
                                    controller(server, router);
                                }
                            });
                        }
                        catch(err) {
                            return done(err);
                        }

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

                        return done();

                        function serverError(res, err){
                            let errResponse = {};
                            errResponse.status = "error";
                            errResponse.code = "serverError";
                            errResponse.message = "An internal error occured";
                            errResponse.data = {};

                            // Handle Error object
                            if(err instanceof Error) {
                                errResponse = _.merge(errResponse, {message: err.message, data: {stack: err.stack, code: err.code}});
                            }

                            if(_.isString(err)) {
                                errResponse.message = err;
                            }

                            return res.status(500).send(errResponse)
                        }
                    }
                ], function(err) {
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
        .then(function() {
            server.logger.verbose("Database migration executed with success");
        })
        .catch(function(err) {
            server.logger.error("runMigration failed");
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
function configureOrm(server) {
    server.orm = {};
    server.orm.sequelize = new Sequelize('database', 'admin', null, server.config.sharedDatabase.connexion);

    let modelsPath = "./models";

    // init dir for storage first
    utils.initDirsSync(path.dirname(server.config.sharedDatabase.connexion.storage));

    // Define models
    server.orm.models = {};
    server.orm.models.Logs = require(modelsPath + '/logs')(server.orm.sequelize, server);
    server.orm.models.User = require(modelsPath + '/user')(server.orm.sequelize, server);
    server.orm.models.Plugins = require(modelsPath + '/plugins')(server.orm.sequelize, server);
    server.orm.models.Task = require(modelsPath + '/task')(server.orm.sequelize, server);
    server.orm.models.Scenario = require(modelsPath + '/scenario')(server.orm.sequelize, server);
    server.orm.models.Notification = require(modelsPath + '/notification')(server.orm.sequelize, server);

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

    server.logger.verbose("Synchronizing ORM");

    // create tables
    // let force = server.config.sharedDatabase.connexion.dropOnStartup;
    return Promise
        .all([
            // server.orm.models.Logs.sync({force: force}),
            // server.orm.models.User.sync({force: force}),
            // server.orm.models.Plugins.sync({force: force}),
            // server.orm.models.Task.sync({force: force}),
            // server.orm.models.Scenario.sync({force: force}),
            // server.orm.models.Notification.sync({force: force}),
        ])
        .then(function () {
            server.logger.verbose("ORM initialized");
            // Add the db as a storage for logs
            // Every logs since this point will be stored in db
            // server.system.logger.addTransportForAllLoggers(new WinstonTransportSequelize({
            //     sequelize: server.orm.sequelize,
            //     model: server.orm.models.Logs,
            //     level: server.system.config.log.level
            // }));

            // By default there is always one user. The administrator
            return server.orm.models.User.initAdmin();
        });
}
"use strict";
let router = require('express').Router();
let _ = require('lodash');
let bodyParser = require("body-parser");
let utils = require('my-buddy-lib').utils;
let requireAll = require('my-buddy-lib').requireAll;
let WinstonTransportSequelize = require('my-buddy-lib').WinstonTransportSequelize;
let Sequelize = require('sequelize');
let async = require("async");
let validator = require("validator");
let path = require("path");
module.exports = function (server, app, cb) {
    async.series([
        function (done) {
            configureOrm(server, done);
        },
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
            app.use(function (req, res, next) {
                res.badRequest = function (data) {
                    if (_.isString(data)) {
                        data = { message: data };
                    }
                    data.data = data.data || {};
                    if (data.errors) {
                        data.data.errors = data.errors;
                    }
                    let errResponse = {
                        status: data.status || "error",
                        code: data.code || "badRequest",
                        message: data.message || "",
                        data: data.data || {}
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
                };
                return next();
            });
            app.use('/', router);
            app.use('/api', router);
            app.use(function (err, req, res, next) {
                return res.serverError('Something broke! ' + err.stack);
            });
            validator.isModuleId = function (value) {
                return this.matches(value, /\w+:\w+/);
            };
            validator.isUsername = function (value) {
                return this.isAlpha(value);
            };
            return done();
        }
    ], cb);
};
function configureOrm(server, done) {
    server.orm = {};
    server.orm.sequelize = new Sequelize('database', 'admin', null, server.system.config.sharedDatabase.connexion);
    let modelsPath = "./models";
    utils.initDirsSync(path.dirname(server.system.config.sharedDatabase.connexion.storage));
    server.orm.models = {};
    server.orm.models.Logs = require(modelsPath + '/logs')(server.orm.sequelize, server);
    server.orm.models.User = require(modelsPath + '/user')(server.orm.sequelize, server);
    server.orm.models.Plugins = require(modelsPath + '/plugins')(server.orm.sequelize, server);
    server.orm.models.Task = require(modelsPath + '/task')(server.orm.sequelize, server);
    server.orm.models.Scenario = require(modelsPath + '/scenario')(server.orm.sequelize, server);
    server.orm.models.Notification = require(modelsPath + '/notification')(server.orm.sequelize, server);
    server.orm.models.User.hasMany(server.orm.models.Plugins);
    server.orm.models.User.hasMany(server.orm.models.Task);
    server.orm.models.User.hasMany(server.orm.models.Scenario);
    server.orm.models.Plugins.hasMany(server.orm.models.Task);
    server.orm.models.Plugins.belongsTo(server.orm.models.User);
    server.orm.models.Task.belongsTo(server.orm.models.User);
    server.orm.models.Task.belongsTo(server.orm.models.Plugins);
    server.orm.models.Scenario.belongsTo(server.orm.models.User);
    server.orm.models.Plugins.hook('afterUpdate', function (plugin, options) {
        server.emit('orm:plugins:updated', plugin);
    });
    server.orm.models.User.hook('afterUpdate', function (user, options) {
        server.emit('orm:user:updated', user);
    });
    Promise
        .all([
        server.orm.models.Logs.sync({ force: server.system.config.sharedDatabase.connexion.dropOnStartup }),
        server.orm.models.User.sync({ force: server.system.config.sharedDatabase.connexion.dropOnStartup }),
        server.orm.models.Plugins.sync({ force: server.system.config.sharedDatabase.connexion.dropOnStartup }),
        server.orm.models.Task.sync({ force: server.system.config.sharedDatabase.connexion.dropOnStartup }),
        server.orm.models.Scenario.sync({ force: server.system.config.sharedDatabase.connexion.dropOnStartup }),
        server.orm.models.Notification.sync({ force: server.system.config.sharedDatabase.connexion.dropOnStartup }),
    ])
        .then(function () {
        server.logger.verbose("ORM initialized");
        return server.orm.models.User.initAdmin();
    })
        .then(function () {
        return done();
    })
        .catch(done);
}

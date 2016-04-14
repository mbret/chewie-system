"use strict";

var router      = require('express').Router();
var _           = require('lodash');
var bodyParser  = require("body-parser");
var utils       = require('my-buddy-lib').utils;
var requireAll  = require('my-buddy-lib').requireAll;

module.exports = function(server, app, cb){

    app.use(bodyParser.json());       // to support JSON-encoded bodies

    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));

    app.use(function allowCrossDomain(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", "true");
        next();
    });

    // Require all controllers
    requireAll({
        dirname: __dirname + '/controllers',
        recursive: true,
        resolve: function(controller){
            controller(server, router);
        }
    });

    app.use(function(req, res, next){

        res.badRequest = function(data){
            return res.status(400).send(data);
        };

        res.created = function(data){
            return res.status(201).send(data);
        };

        res.ok = function(data){
            return res.status(200).send(data);
        };

        res.notFound = function(data){
            return res.status(404).send(data);
        };

        res.serverError = function(err){
            server.logger.error(err.stack);
            return res.status(500).send(err.stack)
        };

        return next();
    });

    app.use('/', router);

    // Error handler
    app.use(function(err, req, res, next) {
        server.logger.error(err);
        return res.status(500).send('Something broke! ' + err.stack);
    });

    return cb();
};
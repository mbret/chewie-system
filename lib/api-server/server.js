'use strict';

var router      = require('express').Router();
var _           = require('lodash');
var bodyParser  = require("body-parser");
var app         = require('express')();
var server      = require('http').Server(app);
var io          = require('socket.io');
var https       = require('https');
var logger      = LOGGER.getLogger('Api server');
var fs          = require('fs');
var utils       = require('my-buddy-lib').utils;
var requireAll  = require('my-buddy-lib').requireAll;
var privateKey  = fs.readFileSync(CONFIG_DIR + '/ssl/server.key', 'utf8');
var certificate = fs.readFileSync(CONFIG_DIR + '/ssl/server.crt', 'utf8');
var path        = require('path');

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon){

        var self        = this;
        this.daemon     = daemon;
        this.system     = daemon;
        this.logger     = logger;
        self.server = null;

        app.use(bodyParser.json());       // to support JSON-encoded bodies

        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }));
    }

    initialize(cb){
        var self = this;

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
                app.use('/', controller(self, router));
            }
        });

        // Require all responses
        // var customResponses = {};
        // requireAll({
        //     dirname: __dirname + '/responses',
        //     resolve: function(response, filename){
        //         customResponses[path.basename(filename, '.js')] = response;
        //     }
        // });
        // app.use(function(err, req, res, next){
        //     console.log(res);
        //     res = _.merge(res, customResponses);
        //     console.log(res);
        //     next();
        // });

        // Error handler
        app.use(function(err, req, res, next) {
            self.logger.error(err);
            return res.status(500).send('Something broke! ' + err.stack);
        });

        self._startServer(function(err){
            if(err){
                return cb(err);
            }
            self.logger.verbose('Initialized');
            return cb();
        });
    }

    _startServer(cb){
        var self = this;

        //var server = https.createServer(credentials, app).listen(self.config.port, function () {
        this.server = https.createServer({key: privateKey, cert: certificate}, app).listen(self.daemon.configHandler.getConfig().apiPort, function () {
            return cb();
        });

        var mySocket = io(self.server, {});
        require('./socket')(self, mySocket);
    }

    getConfig(){
        return this.config;
    }

    getLocalAddress(){
        return 'https://localhost:' + this.server.address().port;
    }

    getRemoteAddress(){
        return 'https://' + this.daemon.configHandler.getConfig().realIp + ':' + this.server.address().port
    }
}

module.exports = Module;
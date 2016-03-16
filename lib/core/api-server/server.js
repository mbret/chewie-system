'use strict';

var router      = require('express').Router();
var _           = require('lodash');
var bodyParser  = require("body-parser");
var app         = require('express')();
var server      = require('http').Server(app);
var io          = require('socket.io');
var https       = require('https');
var logger      = LOGGER.getLogger('Api server');
var fs = require('fs');
var utils       = require(MODULES_DIR + '/utils');
var requireAll  = require('require-all');
var privateKey  = fs.readFileSync(CONFIG_DIR + '/server.key', 'utf8');
var certificate = fs.readFileSync(CONFIG_DIR + '/server.crt', 'utf8');

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon){

        var self        = this;
        this.daemon     = daemon;
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

        // Error handelr
        app.use(function(err, req, res, next) {
            self.logger.error(err);
            return res.status(500).send('Something broke! ' + err.stack);
        });

        self._startServer(cb);
    }

    _startServer(cb){
        var self = this;
        self.logger.verbose('Starting api server...');

        //var server = https.createServer(credentials, app).listen(self.config.port, function () {
        this.server = https.createServer({key: privateKey, cert: certificate}, app).listen(self.daemon.configHandler.getConfig().apiPort, function () {
            return cb();
        });

        var mySocket = io(self.server, {});
        mySocket.on('connection', function (socket) {

            var onNewNotification = function(notification){
                self.logger.debug('One notification to send', notification);
                socket.emit('notification:new', notification);
            };

            var onUserLoggedOutTaskComplete = function(){
                socket.emit('user:logged:out:task:complete');
            };

            // Listen for new notifications
            // Then pass notification through socket
            self.daemon.on('notification:new', onNewNotification);
            self.daemon.on('user:logged:out:task:complete', onUserLoggedOutTaskComplete);

            // Once socket is disconnected remove the listener for notification
            // avoid listeners leak
            socket.on('disconnect', function(){
                self.daemon.removeListener('notification:new', onNewNotification);
                self.daemon.removeListener('user:logged:out:task:complete', onNewNotification);
            });
        });
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
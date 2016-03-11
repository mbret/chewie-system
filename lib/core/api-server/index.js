'use strict';

var router      = require('express').Router();
var _           = require('lodash');
var bodyParser  = require("body-parser");
var app         = require('express')();
var server      = require('http').Server(app);
//var io          = require('socket.io')(server);
var io          = require('socket.io');
var https       = require('https');
var http       = require('http');
var logger      = LOGGER.getLogger('Api server');
var fs = require('fs');
var privateKey  = fs.readFileSync(__dirname+'/config/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname+'/config/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var utils = require(MODULES_DIR + '/utils');

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

        app.use('/', require('./controllers/base.js').call(this, self, router));
        app.use('/', require('./controllers/plugins/modules.js').call(this, self, router));
        app.use('/', require('./controllers/tasks.js').call(this, self, router));
        app.use('/', require('./controllers/plugins.js').call(this, self, router));
        app.use('/', require('./controllers/messages.js').call(this, self, router));
        app.use('/', require('./controllers/users.js').call(this, self, router));
        app.use('/', require('./controllers/plugins/triggers.js').call(this, self, router));

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
        this.server = http.createServer(app).listen(MyBuddy.config.apiPort, function () {

            self.daemon.registerTaskOnShutdown(function(done){
                // ... process some task like close server
                done();
            });

            return cb();
        });

        var mySocket = io(self.server, {});
        mySocket.on('connection', function (socket) {

            var onNewNotification = function(notification){
                self.logger.debug('One notification to send', notification);
                socket.emit('notification:new', notification);
            };

            // Listen for new notifications
            // Then pass notification through socket
            self.daemon.on('notification:new', onNewNotification);

            socket.on('my other event', function (data) {

            });

            // Once socket is disconnected remove the listener for notification
            // avoid listeners leak
            socket.on('disconnect', function(){
                self.daemon.removeListener('notification:new', onNewNotification);
            });
        });
    }

    getConfig(){
        return this.config;
    }
}

Module.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = Module;
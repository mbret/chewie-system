'use strict';

var router      = require('express').Router();
var _           = require('lodash');
var bodyParser  = require("body-parser");
var app         = require('express')();
var server      = require('http').Server(app);
var io          = require('socket.io')(server);

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon, scheduler, logger){

        var self        = this;
        this.daemon     = daemon;
        this.config     = _.merge({
            port: 3001
        }, []);
        this.logger     = logger;

        app.use(bodyParser.json());       // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }));
        app.use(function allowCrossDomain(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    }

    initialize(cb){
        var self = this;

        app.use('/', require('./controllers/base.js')(self, router));
        app.use('/', require('./controllers/modules-controller.js')(self, router));
        app.use('/', require('./controllers/tasks-controller.js')(self, router));
        app.use('/', require('./controllers/plugins.js')(self, router));
        app.use('/', require('./controllers/messages.js')(self, router));

        app.use(function(err, req, res, next) {
            self.logger.error(err);
            res.status(500).send('Something broke! ' + err.stack);
            return;
        });

        this._startServer(cb);
    }

    _startServer(cb){
        var self = this;
        self.logger.verbose('Starting api server...');

        server.listen(self.config.port, function () {
            var host = server.address().address;
            var port = server.address().port;

            self.logger.verbose('Api endpoint listening at http://%s:%s', host, port);

            self.daemon.registerTaskOnShutdown(function(done){
                // ... process some task like close server
                done();
            });



            return cb();
        });

        io.on('connection', function (socket) {
            self.daemon.on('notification:new', function(notification){
                self.logger.debug('One notification to send', notification);
                socket.emit('notification:new', notification);
            });

            socket.on('my other event', function (data) {
                console.log(data);
            });
        });
    }
}

Module.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = Module;
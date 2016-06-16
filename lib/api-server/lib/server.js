'use strict';


var app         = require('express')();
var io          = require('socket.io');
var https       = require('https');
var fs          = require('fs');
var _           = require('lodash');
var privateKey  = fs.readFileSync(CONFIG_DIR + '/ssl/server.key', 'utf8');
var certificate = fs.readFileSync(CONFIG_DIR + '/ssl/server.crt', 'utf8');
var path        = require('path');
var requireAll  = require('my-buddy-lib').requireAll;
var EventEmitter = require("events");

class Server extends EventEmitter {

    constructor(system){
        super();
        this.logger = system.logger.Logger.getLogger('Api server');

        var self = this;
        this.system = system;
        this.initialized = false;
        // will contain the http server
        this.server = null;

        this.services = new Map();

        requireAll({
            dirname: __dirname + '/services',
            recursive: true,
            resolve: function(module){
                self.services.set(module.name, new module(system));
            }
        });
    }

    initialize(cb){
        var self = this;

        require('./bootstrap')(this, app, function(err){
            if(err){
                return (err);
            }

            self._startServer(function(err){
                if(err){
                    return cb(err);
                }
                self.emit("initialized");
                self.logger.verbose('Initialized');
                self.initialized = true;
                return cb();
            });
        });
    }

    _startServer(cb){
        var self = this;
        var port = self.system.configHandler.getConfig().apiPort;
        var credentials = {key: privateKey, cert: certificate};

        this.server = https.createServer(credentials, app);
        this.server.listen(port);

        this.server.on('error', function(error){
            if (error.syscall !== 'listen') {
                throw error;
            }

            var bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    break;
                default:
                    break;
            }
            return cb(error);
        });

        this.server.on('listening', function(){
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
        return 'https://' + this.system.configHandler.getConfig().realIp + ':' + this.server.address().port
    }
}

module.exports = Server;
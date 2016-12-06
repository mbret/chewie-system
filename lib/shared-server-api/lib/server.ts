'use strict';

var app         = require('express')();
var io          = require('socket.io');
var https       = require('https');
var http = require("http");
var fs          = require('fs');
import * as _ from "lodash";
var path        = require('path');
var requireAll  = require('my-buddy-lib').requireAll;
var EventEmitter = require("events");
import * as Services from "./services";
let self = null;

export class Server extends EventEmitter {

    io: any;

    constructor(system){
        super();
        self = this;
        this.logger = system.logger.Logger.getLogger('Api server');

        var self = this;
        this.system = system;
        this.initialized = false;
        this.server = null;
        this.services = {};
        this.io = null;

        // Include all services
        _.forEach(Services, function(module, key) {
            self.services[key.charAt(0).toLowerCase() + key.slice(1)] = new module(system);
        });
    }

    initialize(cb){
        var self = this;

        require(__dirname + '/bootstrap')(this, app, function(err){
            if(err){
                return cb(err);
            }

            self._startServer(function(err){
                if(err){
                    return cb(err);
                }
                self.logger.verbose('Initialized');
                self.emit("initialized");
                self.initialized = true;
                return cb();
            });
        });
    }

    _startServer(cb){
        var port = self.system.config.sharedApiPort;

        // use ssl ?
        if (this.system.config.sharedApiSSL.activate) {
            let privateKey = fs.readFileSync(this.system.config.sharedApiSSL.key, 'utf8');
            let certificate = fs.readFileSync(this.system.config.sharedApiSSL.cert, 'utf8');
            this.server = https.createServer({key: privateKey, cert: certificate}, app);
        } else {
            this.server = http.createServer(app);
        }

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

        this.io = io(self.server, {});
        require('./socket')(self, this.io);
    }

    getConfig(){
        return this.config;
    }

    getLocalAddress(){
        return 'https://localhost:' + this.server.address().port;
    }
}
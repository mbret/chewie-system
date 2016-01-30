'use strict';

var express = require('express');
var _       = require('lodash');
var app     = express();
var bodyParser = require("body-parser");
var lessMiddleware = require('less-middleware');
var path = require('path');
var os = require('os');
var logger = LOGGER.getLogger('Api server');

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon){

        var self        = this;
        this.daemon     = daemon;
        this.config     = _.merge({
            port: 3000
        }, []);
        this.logger     = logger;

        app.set('views', __dirname + '/www');
        app.set('view engine', 'ejs');
        app.use(lessMiddleware(__dirname + '/public', {
            dest: path.join(__dirname + '/.tmp/public')
        }));
        app.use(express.static(__dirname + '/public'));
        app.use(express.static(__dirname + '/.tmp/public'));
        app.use(bodyParser.json() );       // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }));
    }

    initialize(cb){

        var self = this;

        app.get('/', function(req, res){
            return res.render('index');
        });

        app.use(function(err, req, res, next) {
            return res.status(500).send('Something broke!' + err.stack);
        });

        self.logger.verbose('Starting web server...');
        var server = app.listen(self.config.port, function () {
            var host = server.address().address;
            var port = server.address().port;

            self.logger.verbose('Web server available at http://%s:%s', host, port);

            return cb();
        });
    }
}

Module.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = Module;
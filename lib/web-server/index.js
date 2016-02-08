'use strict';

var express = require('express');
var _       = require('lodash');
var app     = express();
var https   = require('https');
var bodyParser = require("body-parser");
var lessMiddleware = require('less-middleware');
var path = require('path');
var os = require('os');
var logger = LOGGER.getLogger('Web server');
var fs = require('fs');
var privateKey  = fs.readFileSync(__dirname+'/config/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname+'/config/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var utils = require(LIB_DIR + '/utils.js');

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon){

        var self        = this;
        this.daemon     = daemon;
        this.config     = _.merge({
            ip: 'localhost',
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

        utils.getCurrentIp(function (err, add) {

            if(err){
                return cb(err);
            }

            self.config.ip = add;

            MyBuddy.speechHandler.registerNewCommand('restart', function(){
                MyBuddy.restart();
            });

            // wait for api server to start
            MyBuddy.on('api-server:initialized', function(){

                app.get('/', function(req, res){
                    return res.render('index');
                });

                app.get('/configuration.js', function(req, res){

                    // determine api server ip
                    // Serve localhost if same ip (avoid problem with certificate)
                    var apiUrl = 'localhost:' + MyBuddy.apiServer.config.port;
                    if(self.config.ip !== MyBuddy.apiServer.config.ip){
                        apiUrl = MyBuddy.apiServer.config.ip + ':' + MyBuddy.apiServer.config.port;
                    }
                    var config = {
                        apiUrl: apiUrl
                    };
                    res.setHeader('Content-Type', 'application/javascript');
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', 0);
                    res.send('window.APP_CONFIG = ' + JSON.stringify(config) + ';');
                });

                app.use(function(err, req, res, next) {
                    return res.status(500).send('Something broke!' + err.stack);
                });

                self.logger.verbose('Starting web server...');

                var server = https.createServer(credentials, app).listen(self.config.port, function () {
                    var host = server.address().address;
                    var port = server.address().port;

                    self.logger.verbose('Web server available at http://%s:%s', host, port);

                    return cb();
                });
            });

        });
    }
}

Module.require = ['daemon', 'scheduler', 'logger', 'helper'];

module.exports = Module;
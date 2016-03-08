'use strict';

var express     = require('express');
var router      = require('express').Router();
var _           = require('lodash');
var app         = express();
var https       = require('https');
var async       = require('async');
var http        = require('http');
var bodyParser  = require("body-parser");
var lessMiddleware = require('less-middleware');
var path        = require('path');
var logger      = LOGGER.getLogger('Web server');
var fs          = require('fs');
var privateKey  = fs.readFileSync(__dirname+'/config/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname+'/config/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var utils       = require(MODULES_DIR + '/utils');
var google      = require('googleapis');
var OAuth2      = google.auth.OAuth2;
var oauth2Client = null;
const child_process = require('child_process');

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon){
        this.daemon     = daemon;
        this.logger     = logger;
        this.server     = null;
    }

    initialize(cb){

        var self = this;

        oauth2Client = new OAuth2(this.daemon.user.getConfig().externalServices.google.auth.clientId, this.daemon.user.getConfig().externalServices.google.auth.clientSecret, 'https://localhost:3000/auth/google/callback');

        // wait for api server to start
        this.daemon.on('api-server:initialized', function(){
            async.series([

                // Run gulp
                function(done){
                    self._runGulp(done);
                },

                // Start server
                function(done){

                    // As the server provide a way to speak
                    // We register some default and useful commands
                    self._initSpeechHandlerCommands();

                    // -------------------------
                    //
                    //  Server initialization
                    //
                    // -------------------------
                    self.logger.verbose('Starting web server...');

                    app.set('views', __dirname + '/www');
                    app.set('view engine', 'ejs');

                    // Every hit for .less will generate the css file into the public tmp.
                    app.use(lessMiddleware(__dirname + '/public', {
                        dest: path.join(MyBuddy.config.tmpDir + '/web-server')
                    }));
                    app.use(express.static(__dirname + '/public'));

                    // Merge the public tmp folder with regular public for static assets.
                    app.use(express.static(MyBuddy.config.tmpDir + '/web-server'));

                    // to support JSON-encoded bodies
                    app.use(bodyParser.json() );

                    // to support URL-encoded bodies
                    app.use(bodyParser.urlencoded({
                        extended: true
                    }));

                    self._initRoutes(app);

                    app.use(function(err, req, res, next) {
                        return res.status(500).send('Something broke!' + err.stack);
                    });

                    self.server = http.createServer(app).listen(self.daemon.config.webServerPort, done);
                }

            ], cb);
        });
    }

    _initRoutes(app){
        var routes = require('./routes');
        routes.call(this, app, router);
    }

    _getGoogleOauthClient(){
        oauth2Client.setCredentials({
            access_token: MyBuddy.user.getCredentials().google.accessToken,
            refresh_token: MyBuddy.user.getCredentials().google.refreshToken
        });
        return oauth2Client;
    }

    _runGulp(cb){
        child_process.exec('gulp inject_js', { cwd: __dirname }, function (error, stdout, stderr) {
            if(error){
                logger.error('Error when running gulp task, here is the stdout:', stdout);
            }
            return cb(error);
        });
    }

    _initSpeechHandlerCommands(){
        var self = this;
        this.daemon.speechHandler.registerNewCommand('restart', function(){
            self.daemon.restart();
        });
    }
}

module.exports = Module;
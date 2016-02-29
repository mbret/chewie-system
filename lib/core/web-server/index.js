'use strict';

var express = require('express');
var _       = require('lodash');
var app     = express();
var https   = require('https');
var async = require('async');
var http   = require('http');
var bodyParser = require("body-parser");
var lessMiddleware = require('less-middleware');
var path = require('path');
var os = require('os');
var logger = LOGGER.getLogger('Web server');
var fs = require('fs');
var privateKey  = fs.readFileSync(__dirname+'/config/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname+'/config/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var utils = require(MODULES_DIR + '/utils');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = null;
const child_process = require('child_process');

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon){

        var self        = this;
        this.daemon     = daemon;
        this.logger     = logger;
        this.server     = null;

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
    }

    initialize(cb){

        var self = this;

        oauth2Client = new OAuth2(MyBuddy.user.getConfig().externalServices.google.auth.clientId, MyBuddy.user.getConfig().externalServices.google.auth.clientSecret, 'https://localhost:3000/auth/google/callback');

        // wait for api server to start
        MyBuddy.on('api-server:initialized', function(){
            async.series([

                // Run gulp
                function(done){
                    child_process.exec('gulp inject_js', { cwd: __dirname }, function (error, stdout, stderr) {
                        return done(error);
                    });
                },

                // Start server
                function(done){
                    MyBuddy.speechHandler.registerNewCommand('restart', function(){
                        MyBuddy.restart();
                    });

                    self.initRoutes(app);

                    app.use(function(err, req, res, next) {
                        return res.status(500).send('Something broke!' + err.stack);
                    });

                    self.logger.verbose('Starting web server...');

                    //self.server = https.createServer(credentials, app).listen(self.config.port, function () {
                    self.server = http.createServer(app).listen(MyBuddy.config.webServerPort, done);
                }

            ], function (err){
                return cb(err);
            });
        });
    }

    initRoutes(app){

        var self = this;

        /**
         * Return the configuration as json for app
         */
        app.get('/configuration.js', function(req, res){

            // determine api server ip
            // Serve localhost if same ip (avoid problem with certificate)
            var apiUrl = 'localhost:' + MyBuddy.config.apiPort;

            // When outside of localhost, use real ip.
            if(req.ip !== '::1'){
                apiUrl = MyBuddy.config.realIp + ':' + MyBuddy.config.apiPort;
            }

            var config = {
                apiUrl: apiUrl,
                systemConfig: MyBuddy.config
            };
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', 0);
            res.send('window.SERVER_CONFIG = ' + JSON.stringify(config) + ';');
        });

        /**
         * Auth to google
         * https://developers.google.com/drive/v3/web/quickstart/nodejs
         */
        app.get('/auth/google', function(req, res){

            if(!MyBuddy.user.getConfig().externalServices.google.auth.clientId || !MyBuddy.user.getConfig().externalServices.google.auth.clientSecret){
                return res.status(400).send('Please set your credentials first');
            }

            // generate a url that asks permissions for Google+ and Google Calendar scopes
            var scopes = [
                'https://www.googleapis.com/auth/plus.me',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/drive'
            ];

            var url = oauth2Client.generateAuthUrl({
                access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
                scope: scopes // If you only need one scope you can pass it as string
            });

            return res.redirect(url);
        });

        /**
         * Auth to google callback
         *
         */
        app.get('/auth/google/callback', function(req, res){

            var authCode = req.query.code;

            if(!MyBuddy.user.getConfig().externalServices.google.auth.clientId || !MyBuddy.user.getConfig().externalServices.google.auth.clientSecret){
                return res.status(400).send('Please set your credentials first');
            }

            oauth2Client.getToken(authCode, function(err, tokens) {
                if(err){
                    return res.status(500).send(err);
                }

                // Now tokens contains an access_token and an optional refresh_token. Save them.
                MyBuddy.user.getCredentials().google.accessToken = tokens.access_token;
                MyBuddy.user.getCredentials().google.refreshToken = tokens.refresh_token;
                MyBuddy.user.save();

                return res.send(MyBuddy.user.getCredentials());
            });
        });

        /**
         * https://developers.google.com/drive/v3/web/quickstart/nodejs
         */
        app.get('/test/google', function(req, res){
            var oauth = self._getGoogleOauthClient();

            var plus = google.plus('v1');
            var drive = google.drive({ version: 'v3', auth: oauth });

            //plus.people.get({ userId: 'me', auth: oauth }, function(err, response){
            //    console.log(err, response);
            //});

            drive.files.list({
                pageSize: 10,
                fields: "nextPageToken, files(id, name)"
            }, function(err, response) {
                return res.send({
                    err: err,
                    response: response
                })
            });

        });

        /**
         * Bootstrap
         */
        app.get('/', function(req, res){
            return res.render('index');
        });
    }

    _getGoogleOauthClient(){
        oauth2Client.setCredentials({
            access_token: MyBuddy.user.getCredentials().google.accessToken,
            refresh_token: MyBuddy.user.getCredentials().google.refreshToken
        });
        return oauth2Client;
    }
}

module.exports = Module;
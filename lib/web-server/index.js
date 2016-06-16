'use strict';

var express     = require('express');
var router      = require('express').Router();
var app         = express();
var https       = require('https');
var async       = require('async');
var bodyParser  = require("body-parser");
var lessMiddleware = require('less-middleware');
var path        = require('path');
var fs          = require('fs');
var utils       = require('my-buddy-lib').utils;
var google      = require('googleapis');
var expressLayouts = require('express-ejs-layouts');
var OAuth2          = google.auth.OAuth2;
var oauth2Client    = null;
const child_process = require('child_process');
var privateKey      = fs.readFileSync(CONFIG_DIR + '/ssl/server.key', 'utf8');
var certificate     = fs.readFileSync(CONFIG_DIR + '/ssl/server.crt', 'utf8');

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon){
        this.logger = daemon.logger.Logger.getLogger('Web server');
        this.daemon = daemon;
        this.server = null;
    }

    initialize(cb) {

        var self = this;

        // wait for api server to start
        // @todo why wait for api ? slow part
        if(this.daemon.apiServer) {
            onApiInitialized();
        }
        this.daemon.on('api-server:initialized', function(){
            onApiInitialized();
        });

        function onApiInitialized() {
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
                    app.set('layout', 'index');

                    app.use(expressLayouts);

                    // Every hit for .less will generate the css file into the public tmp.
                    app.use(lessMiddleware(__dirname + '/public', {
                        dest: path.join(MyBuddy.configHandler.getConfig().system.tmpDir + '/web-server'),
                    }));
                    app.use(express.static(__dirname + '/public'));

                    // Merge the public tmp folder with regular public for static assets.
                    app.use(express.static(MyBuddy.configHandler.getConfig().system.tmpDir + '/web-server'));

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

                    self.server = https.createServer({key: privateKey, cert: certificate}, app).listen(self.daemon.configHandler.getConfig().webServerPort, done);
                }

            ], cb);
        }
    }

    _initRoutes(app){
        var self = this;
        var routes = require('./routes');
        routes.call(this, app, router);

        // call screens
        var screensModules = [{
            name: "default",
            module: require(path.resolve(__dirname, 'screens/default')),
            root: path.resolve(__dirname, 'screens/default')
        }];
        screensModules.forEach(function(screenModule) {
            var router = require('express').Router();
            screenModule.module.call(self, app, router);

            // isolate screens routes in namespace
            app.use('/screens/' + screenModule.name, router);
            // isolate screens statics asset in namespace
            // so it's easier for the module to retrieve it
            app.use("/screens/" + screenModule.name, express.static(path.resolve(screenModule.root, "public")));
        });
    }

    //_getGoogleOauthClient(){
    //    oauth2Client = new OAuth2(this.daemon.getCurrentProfile().getConfig().externalServices.google.auth.clientId, this.daemon.getCurrentProfile().getConfig().externalServices.google.auth.clientSecret, 'https://localhost:3000/auth/google/callback');
    //    oauth2Client.setCredentials({
    //        access_token: MyBuddy.getCurrentProfile().getCredentials().google.accessToken,
    //        refresh_token: MyBuddy.getCurrentProfile().getCredentials().google.refreshToken
    //    });
    //    return oauth2Client;
    //}

    _runGulp(cb){
        var self = this;
        child_process.exec('gulp inject_js', { cwd: __dirname }, function (error, stdout, stderr) {
            if(error){
                self.logger.error('Error when running gulp task, here is the stdout:', stdout);
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

    getLocalAddress(){
        return 'https://localhost:' + this.server.address().port;
    }

    getRemoteAddress(){
        return 'https://' + this.daemon.configHandler.getConfig().realIp + ':' + this.server.address().port
    }
}

module.exports = Module;
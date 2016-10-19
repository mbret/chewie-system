'use strict';

var express     = require('express');
var router      = require('express').Router();
var app         = express();
var https       = require('https');
var async       = require('async');
var bodyParser  = require("body-parser");
var path        = require('path');
var fs          = require('fs');
var expressLayouts = require('express-ejs-layouts');
const child_process = require('child_process');
var privateKey      = fs.readFileSync(__dirname + '/../configuration/ssl/server.key', 'utf8');
var certificate     = fs.readFileSync(__dirname + '/../configuration/ssl/server.crt', 'utf8');
var EventEmitter = require("events");

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module extends EventEmitter {

    constructor(daemon){
        super();
        this.logger = daemon.logger.Logger.getLogger('Web server');
        this.daemon = daemon;
        this.server = null;
        this.app = app;
        this.modulesRef = new Map();
        this.webServerTmpPublicDir = MyBuddy.config.system.tmpDir + '/web-server/public';
    }

    initialize(cb) {

        var self = this;

        // wait for api server to start
        // @todo why wait for api ? slow part
        if(this.daemon.apiServer) {
            onApiInitialized();
        } else {
            this.daemon.on('api-server:initialized', function(){
                onApiInitialized();
            });
        }

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
                    self.logger.verbose('Starting...');

                    app.set('views', __dirname + '/www');
                    app.set('view engine', 'ejs');
                    app.set('layout', 'index');

                    app.use(expressLayouts);

                    // @todo we use the dev folder to avoid having watch but in prod everything should go to .tmp/public ...
                    app.use(express.static(__dirname + '/public'));
                    app.use(express.static(self.webServerTmpPublicDir));

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

                    self.server = https.createServer({key: privateKey, cert: certificate}, app).listen(self.daemon.config.webServerPort, done);
                }

            ], function(err) {
                if(!err) {
                    self.logger.verbose("Initialized");
                    self.emit("initialized");
                }
                return cb(err);
            });
        }
    }

    registerScreen(name, cb) {
        var self = this;

        // module package config
        var router = require('express').Router();
        // isolate screens routes in namespace
        var routeNamespace = '/screens/' + name;

        app.use(routeNamespace, router);

        self.modulesRef.set(name, { router: router });

        self.logger.verbose("New screen registered under under route namespace %s", routeNamespace);

        return cb(null, app, routeNamespace, router);
    }

    //initializeScreen(screenContainer, cb) {
    //    var self = this;
    //
    //    // module package config
    //    var router = require('express').Router();
    //    // isolate screens routes in namespace
    //    var routeNamespace = '/screens/' + screenContainer.moduleName;
    //
    //    screenContainer.instance.initialize(app, router, routeNamespace, function(err) {
    //        if(err) {
    //            return cb(err);
    //        }
    //
    //        app.use(routeNamespace, router);
    //
    //        self.modulesRef.set(screenContainer.moduleName, { router: router });
    //        self.logger.debug("Initialized screen under route namespace %s with static assets availables at %s", routeNamespace, screenContainer.packageConfig.publicPath);
    //        return cb();
    //    });
    //}

    /**
     *
     * @param screenContainer
     * @param cb
     */
    destroyScreen(screenContainer, cb) {
        var self = this;
        screenContainer.instance.destroy(function(err) {
            if(err) {
                return cb(err);
            }

            // remove router + static relative to this screen module
            self.app._router.stack = self.app._router.stack.filter(function(layer) {
                // Filter middleware that are not the static fn or router fn
                // We need this trick because there are no way to find the correct path or name or whatever.
                // only a regexp for the module exist but is not reliable
                // cf http://stackoverflow.com/questions/10378690/remove-route-mappings-in-nodejs-express which is not appliable with anonymous function
                return (layer.handle !== self.modulesRef.get(screenContainer.name).router);
            });
            self.modulesRef.delete(screenContainer.name);

            return cb();
        });
    }

    _initRoutes(app){
        var routes = require('./routes');
        routes.call(this, app, router);
    }

    _runGulp(cb){
        var self = this;
        child_process.exec('gulp default', {cwd: __dirname, env: {tmpPublicPath: self.webServerTmpPublicDir} }, function (error, stdout, stderr) {
            if(error){
                self.logger.error('Error while running gulp task, here is the stdout:', stdout);
                throw error;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
        return cb();
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
        return 'https://' + this.daemon.config.realIp + ':' + this.server.address().port
    }
}

module.exports = Module;
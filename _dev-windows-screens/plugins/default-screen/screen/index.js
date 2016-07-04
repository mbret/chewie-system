'use strict';

var fs = require('fs');
var async = require("async");
var path = require("path");
var Datastore = require('nedb');
var config = require("./config");
var express = require("express");

var Module = function(helper){
    this.system = helper.system;
    // used to store middleware to be able to delete it on destroy
    // and free the memory
    this.staticMiddlewares = [];
    this.app = null;
};

Module.prototype.initialize = function(cb) {
    var self = this;

    this.system.webServer.registerScreen("default-screen", function(err, app, namespace, router) {
        self._registerScreen(app, router, namespace, cb);
    });
};

Module.prototype.destroy = function(cb) {
    this._destroyScreen(cb);
};

/**
 * Router allow the module to control its own routes.
 * The router is registered under a specific module namespace /screens/module-name
 *
 * A static serving is available at /screens/module-name/public for conveniance.
 *
 * @param app
 * @param router
 * @param namespace
 * @param cb
 * @private
 */
Module.prototype._registerScreen = function(app, router, namespace, cb) {
    var self = this;
    var view = config.indexViewPath;
    this.app = app;
    // For now it use a custom database stored in system data dir
    // we could use profile info and plugin tmp dir
    var db = new Datastore({ filename: path.resolve(self.system.getConfig().system.dataDir, 'screens-default-messages.db') });
    db.loadDatabase(function (err) {
        if(err) {
            return cb(err);
        }

        // isolate screens statics asset in namespace
        // so it's easier for the module to retrieve it
        var staticMiddleware = express.static(config.publicPath);
        app.use(namespace + "/public", staticMiddleware);
        self.staticMiddlewares.push(staticMiddleware);

        router.post("/api/messages", function(req, res) {
            var author = req.body.author || "";
            var content = req.body.content || "";

            if (author == "" || content == "") {
                return res.status(400).send({
                    error: "Please provide author and content"
                });
            }

            var message = {
                author: author,
                content: content,
                date: new Date()
            };

            // save to bdd
            db.insert(message);

            return res.sendStatus(201);
        });

        router.get("/api/messages", function(req, res) {

            db.find({}).sort({date: -1}).exec(function(err, docs) {
                return res.send(docs);
            });
        });

        router.all("/api/*", function(req, res) {
            return res.sendStatus(404);
        });

        router.get('/configuration.js', function(req, res){

            var config = {

            };

            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', 0);
            res.send('window.SERVER_CONFIG = ' + JSON.stringify(config) + ';');
        });

        /**
         * Handle index and all other routes. As we use html5 and real url.
         */
        router.get("/*", function(req, res) {
            return res.render(view, {
                layout: "screens-layout",
                baseUrl: "/screens/default-screen"
            });
        });

        return cb();
    });
};

/**
 * It's important to free all middleware added to app here. Otherwise they will be added to the stack
 * and indefinitly concatened. This will result in uncontrolled behaviour after start/stop several profiles.
 *
 * Router does not need to be free. The web server handle it itself.
 *
 * @param cb
 * @returns {*}
 */
Module.prototype._destroyScreen = function(cb) {
    var self = this;

    if(this.app) {
        // loop over mid stack
        this.app._router.stack = this.app._router.stack.filter(function(layer) {
            var handle = layer.handle;
            var valid = true;
            // loop over each static middleware and remove it
            // compare handle object with the middleware object
            // it work with all middleware (not only static)
            self.staticMiddlewares.forEach(function(staticMiddleware) {
                if(handle === staticMiddleware) {
                    valid = false;
                }
            });
            return valid;
        });
    }
    self.staticMiddlewares = [];

    return cb();
};

module.exports = Module;
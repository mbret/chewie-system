'use strict';

var fs = require('fs');
var async = require("async");
var path = require("path");
var Datastore = require('nedb');
var config = require("./config");
var Module = function(helper){
    this.daemon = helper.system;
};

/**
 * Router allow the module to control its own routes.
 * The router is registered under a specific module namespace /screens/module-name
 *
 * A static serving is available at /screens/module-name/public for conveniance.
 *
 * @param app
 * @param router
 * @param cb
 */
Module.prototype.initialize = function(app, router, cb) {
    var self = this;
    var view = config.indexViewPath;

    // For now it use a custom database stored in system data dir
    // we could use profile info and plugin tmp dir
    var db = new Datastore({ filename: path.resolve(self.daemon.getConfig().system.dataDir, 'screens-default-messages.db') });
    db.loadDatabase(function (err) {
        if(err) {
            return cb(err);
        }

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
 *
 * @param cb
 * @returns {*}
 */
Module.prototype.destroy = function(cb) {
    return cb();
};

module.exports = Module;
'use strict';

var fs = require('fs');
var async = require("async");
var path = require("path");
var Datastore = require('nedb');

module.exports = function(app, router){

    var self = this;

    var view = path.resolve(__dirname, "index");
    var messageView = path.resolve(__dirname, "message");

    // For now it use a custom database stored in system data dir
    var db = new Datastore({ filename: path.resolve(self.daemon.getConfig().system.dataDir, 'screens-default-messages.db') });
    db.loadDatabase(function (err) {
        if(err) {
            console.error(err);
        }
    });

    router.get("/", function(req, res) {
        return res.render(view, {
            layout: "screens-layout"
        });
    });

    router.get("/add-message", function(req, res) {
        return res.render(messageView, {
            layout: "screens-layout"
        });
    });

    router.post("/add-message", function(req, res) {
        var author = req.body.author || "";
        var content = req.body.content || "";

        if (author == "" || content == "") {
            return res.render(messageView, {
                layout: "screens-layout",
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

        return res.render(messageView, {
            layout: "screens-layout"
        });
    });

    router.get("/messages", function(req, res) {

        db.find({}).sort({date: -1}).exec(function(err, docs) {
            return res.send(docs);
        });
    });

};
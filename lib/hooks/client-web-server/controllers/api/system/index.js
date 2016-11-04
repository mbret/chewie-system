'use strict';

var fs = require('fs');
var path = require("path");
var validator = require("validator");

module.exports = function (router) {

    router.post('/sound', function(req, res){

        var resourcePath = req.body.resourcePath;

        // We have a resource to play
        if(typeof resourcePath === "string"){
            if(validator.isLength(resourcePath, {min:1})){
                setImmediate(function() {
                    req.app.locals.system.speaker.playFile(path.resolve(req.app.locals.system.config.resourcesDir, resourcePath));
                });
            }
        }

        return res.ok();
    });
};

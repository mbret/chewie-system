'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var self = this;

    router.get('/triggers', function(req, res){
        var entries = [];

        _.forEach(server.system.triggers, function(entry){
            var tmp = entry.toJSON();
            entries.push(tmp);
        });

        return res.send(entries);
    });

    router.get('/triggers/:id', function(req, res){
        var id = req.params.id;

        var module = _.find(server.daemon.triggers, function(entry){
            return  entry.id === id;
        });

        if(module === undefined){
            return res.status(404).send();
        }

        return res.send(module.toJSON());
    });

    return router;
};
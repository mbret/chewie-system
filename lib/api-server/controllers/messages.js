'use strict';

var _ = require('lodash');
var Scheduler = require(LIB_DIR + '/scheduler.js');
var ModuleScheduler = require(LIB_DIR + '/modules/module-scheduler.js');

module.exports = function(server, router){

    var self = server;

    router.get('/messages-adapters/actions', function(req, res){

        var actions = [];
        _.forEach(self.daemon.messenger.getAdapters(), function(adapter, name){
            var adapterConfig = adapter.getConfig();
            actions.push({
                name: name,
                config: adapterConfig
            })
        });

        return res.send(actions);
    });

    router.get('/messages-adapters/:id', function(req, res){

        var id = req.params.id;
        var adapter = server.daemon.messenger.getAdapter(id);

        if(adapter === null){
            return res.status(400).send('Bad id');
        }

        return res.send(adapter.toJSON());
    });

    router.get('/messages-adapters', function(req, res){

        var entries = [];

        _.forEach(MyBuddy.messenger.getAdapters(), function(entry, name){
            var tmp = entry.toJSON();
            entries.push(tmp);
        });

        return res.send(entries);
    });

    return router;
};
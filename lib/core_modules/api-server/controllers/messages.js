'use strict';

var _ = require('lodash');
var Scheduler = require(LIB_DIR + '/scheduler.js');
var ModuleScheduler = require(LIB_DIR + '/modules/module-scheduler.js');

module.exports = function(server, router){

    var self = server;

    router.put('/messages-adapters/:id', function(req, res){

        var id = req.params.id;
        var adapter = server.daemon.messenger.getAdapter(id);
        if(adapter === null){
            return res.status(400).send('Bad id');
        }

        var options = req.body.options;

        // Update user config
        adapter.setUserConfig({
            options: options
        });

        return res.send();
    });

    router.get('/messages-adapters/:id', function(req, res){
        var id = req.params.id;
        var adapter = server.daemon.messenger.getAdapter(id);
        if(adapter === null){
            return res.status(400).send('Bad id');
        }

        return res.send({
            name: adapter.name,
            config: adapter.config,
            displayName: adapter.config.displayName ? adapter.config.displayName : adapter.name,
            options: adapter.userConfig.options
        });
    });

    router.get('/messages-adapters', function(req, res){

        var adapters = server.daemon.messenger.getAdapters();
        var tmp = [];
        _.forEach(adapters, function(adapter, name){
            var adapterConfig = adapter.config;
            tmp.push({
                name: name,
                config: adapterConfig,
                displayName: adapterConfig.displayName ? adapterConfig.displayName : name,
                options: adapter.userConfig.options
            })
        });
        return res.send(tmp);
    });

    router.get('/adapters/actions', function(req, res){

        var actions = [];
        _.forEach(self.daemon.messenger.getAdapters(), function(adapter, name){
            var adapterConfig = adapter.config;
            actions.push({
                name: name,
                displayName: adapterConfig.displayName ? adapterConfig.displayName : name
            })
        });

        return res.send(actions);
    });

    return router;
};
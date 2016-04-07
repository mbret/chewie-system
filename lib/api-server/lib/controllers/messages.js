'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var self = server;

    router.get('/messages-adapters/actions', function(req, res){

        var actions = [];
        _.forEach(self.system.messageAdaptersHandler.getAdapters(), function(adapter, name){
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
        var adapter = server.system.messageAdaptersHandler.getAdapter(id);

        if(adapter === null){
            return res.status(400).send('Bad id');
        }

        return res.send(adapter.toJSON());
    });

    router.get('/messages-adapters', function(req, res){

        var entries = [];

        _.forEach(MyBuddy.messageAdaptersHandler.getAdapters(), function(entry, name){
            var tmp = entry.toJSON();
            entries.push(tmp);
        });

        return res.send(entries);
    });

    return router;
};
'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    router.get('/plugins', function(req, res){

        var entries = [];

        _.forEach(server.daemon.plugins, function(entry){
            entries.push({
                name: entry.name,
                description: entry.config ? entry.config.description : '',
                modules: entry.modules.map(function(module){
                    return {
                        name: module,
                        activated: true
                    }
                }),
                messageAdapters: entry.messageAdapters.map(function(adapter){
                    return {
                        name: adapter,
                        activated: true
                    }
                })
            });
        });

        return res.send(entries);
    });

    return router;
};
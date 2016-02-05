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

    router.get('/core-modules/:id', function(req, res){

        var id = req.params.id;

        var coreModule = _.find(MyBuddy.coreModules, function(entry){
           return  entry.id === id;
        });

        if(coreModule === undefined){
            return res.status(404).send();
        }

        return res.send(coreModule.toJSON());
    });

    /**
     * Update core module options.
     */
    router.put('/core-modules/:id/options', function(req, res){

        var id = req.params.id;
        var options = req.body.options;

        var coreModule = _.find(MyBuddy.coreModules, function(entry){
            return  entry.id === id;
        });

        if(coreModule === undefined){
            return res.status(404).send();
        }

        // Update user config
        coreModule.setAndSaveUserOptions(_.merge(coreModule.getUserOptions(), options), function(err){
            if(err){
                return res.status(500).send(err);
            }
            return res.send();
        });
    });

    /**
     *
     */
    router.put('/plugins/:plugin/message-adapters/:id/options', function(req, res){

        var id = req.params.id;
        var options = req.body.options;

        var adapter = MyBuddy.messenger.getAdapter(id);

        if(adapter === null || adapter === undefined){
            return res.status(400).send();
        }

        // Update user config
        adapter.setAndSaveUserOptions(_.merge(adapter.getUserOptions(), options), function(err){
            if(err){
                return res.status(500).send(err);
            }
            return res.send();
        });
    });

    router.get('/core-modules', function(req, res){

        var entries = [];

        _.forEach(MyBuddy.coreModules, function(entry){
            var tmp = entry.toJSON();
            entries.push(tmp);
        });

        return res.send(entries);
    });

    return router;
};
'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var PluginsDao = server.system.orm.models.Plugins;

    router.get('/users/:id/modules', function(req, res){
        PluginsDao
            .findAllModulesByUserId(req.params.id)
            .then(function(modules){
                if(!modules){
                    return res.status(400).send('Invalid user id');
                }
                var tmp = modules
                    .filter(function(item){
                        return item.type === req.query.type;
                    })
                    .map(function(item){
                        item.id = item.plugin.name + ':' + item.name;
                        return item;
                    });
                return res.status(200).send(tmp);
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });
    });

    router.get('/users/:user/plugins/:plugin/modules/:module', function(req, res){
        PluginsDao
            .findAllPluginModulesByUserId(req.params.user, req.params.plugin)
            .then(function(modules){
                if(!modules){
                    return res.status(400).send('Invalid user or plugin id');
                }
                var module = modules.find(function(module){
                   return module.name === req.params.module;
                });
                if(module === undefined){
                    return res.status(404).send('No module found');
                }
                module.id = module.plugin.name + ':' + module.name;
                return res.status(200).send(module);
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });
    });

    /**
     *
     */
    router.put('/users-modules/:id/options', function(req, res){

        var id = req.params.id;
        var options = req.body.options;

        var module = _.find(MyBuddy.userModules, function(entry){
            return  entry.id === id;
        });

        if(module === undefined){
            return res.status(404).send();
        }

        // update config
        var newOptions = _.merge(module.getUserOptions(), options);

        // Update user config
        module.setAndSaveUserOptions(newOptions, function(err){
            if(err){
                return res.status(500).send(err);
            }
            return res.send();
        });
    });

    return router;
};
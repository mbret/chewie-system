'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var PluginsDao = server.system.orm.models.Plugins;
    var ModulesDao = server.system.orm.models.Modules;

    router.get('/users/:id/task-modules', function(req, res){
        ModulesDao
            .findAll({
                include: [{
                    model: PluginsDao,
                    where: {
                        userId: req.params.id
                    }
                }],
            })
            .then(function(data){
                if(!data){
                    return res.status(400).send('Invalid user id');
                }
                return res.status(200).send(ModulesDao.toJSON(data));
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });
    });

    router.get('/task-modules/:id', function(req, res){
        var id = req.params.id;

        var module = _.find(MyBuddy.userModules, function(entry){
            return  entry.id === id;
        });

        if(module === undefined){
            return res.status(404).send();
        }

        return res.send(module.toJSON());
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
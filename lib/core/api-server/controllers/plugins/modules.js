'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    router.get('/task-modules', function(req, res){
        var modules = MyBuddy.userModules;
        var tmp = [];

        _.forEach(modules, function(module, name){
            tmp.push(module.toJSON());
        });

        return res.send(tmp);
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
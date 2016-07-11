'use strict';

var _ = require('lodash');
var validator = require('validator');
var util = require('util');

module.exports = function(server, router){

    var PluginsDao = server.orm.models.Plugins;

    router.get('/users/:user/plugins', function(req, res){

        var user = req.params.user;

        PluginsDao
            .findAll({
                where: {
                    userId: user
                }
            })
            .then(function(plugins){
                if(!plugins){
                    return res.notFound('Invalid user id');
                }
                return res.ok(PluginsDao.toJSON(plugins));
            })
            .catch(function(err){
                return res.serverError(err);
            });
    });

    /**
     *
     */
    router.get('/users/:user/plugins/:plugin', function(req, res){

        var userId = req.params.user;
        var id = req.params.plugin;

        var search = {
            userId: userId
        };

        if(validator.isInt(id)) {
            search.id = id;
        }
        else {
            search.name = id;
        }

        PluginsDao
            .findOne({
                where: search
            })
            .then(function(plugin){
                if(!plugin){
                    return res.notFound();
                }
                return res.ok(plugin.toJSON());
            })
            .catch(function(err){
                return res.serverError(err);
            });
    });

    router.put('/users/:user/plugins/:plugin', function(req, res){
        var user = req.params.user;
        var pluginId = req.params.plugin;
        var userOptions = req.body.userOptions;
        var toUpdate = {};

        // validate body
        var errors = new Map();
        if(userOptions !== undefined){
            if(!_.isPlainObject(userOptions)){
                errors.set('userOptions', 'Invalid options');
            }
            toUpdate.userOptions = userOptions;
        }

        if(errors.size > 0){
            return res.badRequest(errors);
        }

        PluginsDao
            .findOne({
                where: { userId: user, id: pluginId }
            })
            .then(function(plugin){
                if(!plugin){
                    return res.notFound();
                }

                return plugin.update(toUpdate).then(function(test){
                    server.system.notificationService.push('success', util.format('The plugin %s options has been updated', plugin.name));
                    return res.ok(test.toJSON());
                });
            })
            .catch(function(err){
                return res.serverError(err);
            });
    });

    /**
     * Create a plugin
     */
    router.post("/users/:user/plugins", function(req, res) {
        var modulePackage = req.body.modulePackage;
        var pluginPackage = req.body.pluginPackage;
        var version = req.body.version;
        var description = req.body.description;
        var name = req.body.name;
        var userId = parseInt(req.params.user);

        var plugin = {
            modulePackage: modulePackage,
            pluginPackage: pluginPackage,
            version: version,
            description: description,
            name: name,
            userId: userId
        };

        // normalize
        plugin.pluginPackage.modules = plugin.pluginPackage.modules || [];

        // check validity of module config
        plugin.pluginPackage.modules.forEach(function(moduleConfig) {
            if(["task", "trigger"].indexOf(moduleConfig.type) < 0) {
                return res.badRequest("The module config " + moduleConfig.type + " is not valid for plugin " + plugin.name);
            }
        });

        // server.logger.verbose("Creating plugin with data %s", util.inspect(plugin));
        return PluginsDao.create(plugin)
            .then(function(created) {
                server.logger.verbose("Plugin %s created with id %d for user %s", created.name, created.id, created.userId);
                return res.created(created);
            })
            .catch(res.serverError);

    });

    //router.get('/plugins', function(req, res){
    //
    //    var entries = [];
    //
    //    _.forEach(server.system.plugins, function(entry){
    //        entries.push({
    //            name: entry.name,
    //            description: entry.config ? entry.config.description : '',
    //            modules: entry.modules.map(function(module){
    //                return {
    //                    name: module,
    //                    activated: true
    //                }
    //            }),
    //            outputAdapters: entry.outputAdapters.map(function(adapter){
    //                return {
    //                    name: adapter,
    //                    activated: true
    //                }
    //            })
    //        });
    //    });
    //
    //    return res.send(entries);
    //});

    //router.get('/core-modules/:id', function(req, res){
    //
    //    var id = req.params.id;
    //
    //    var coreModule = _.find(MyBuddy.coreModules, function(entry){
    //       return  entry.id === id;
    //    });
    //
    //    if(coreModule === undefined){
    //        return res.status(404).send();
    //    }
    //
    //    return res.send(coreModule.toJSON());
    //});

    /**
     * Update core module options.
     */
    //router.put('/core-modules/:id/options', function(req, res){
    //
    //    var id = req.params.id;
    //    var options = req.body.options;
    //
    //    var coreModule = _.find(MyBuddy.coreModules, function(entry){
    //        return  entry.id === id;
    //    });
    //
    //    if(coreModule === undefined){
    //        return res.status(404).send();
    //    }
    //
    //    // Update user config
    //    coreModule.setAndSaveUserOptions(_.merge(coreModule.getUserOptions(), options), function(err){
    //        if(err){
    //            return res.status(500).send(err);
    //        }
    //        return res.send();
    //    });
    //});

    /**
     *
     */
    //router.put('/plugins/:plugin/output-adapters/:id/options', function(req, res){
    //
    //    var id = req.params.id;
    //    var options = req.body.options;
    //
    //    var adapter = MyBuddy.outputAdaptersHandler.getAdapter(id);
    //
    //    if(adapter === null || adapter === undefined){
    //        return res.status(400).send();
    //    }
    //
    //    // Update user config
    //    adapter.setAndSaveUserOptions(_.merge(adapter.getUserOptions(), options), function(err){
    //        if(err){
    //            return res.status(500).send(err);
    //        }
    //        return res.send();
    //    });
    //});

    return router;
};
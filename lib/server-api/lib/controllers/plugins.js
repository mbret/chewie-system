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
            userId: userId,
            id: id
        };

        PluginsDao
            .findOne({
                where: search
            })
            .then(function(plugin){
                if(!plugin){
                    return res.notFound();
                }
                var json = plugin.toJSON();
                json.modules = plugin.getModules();
                return res.ok(json);
            })
            .catch(function(err){
                return res.serverError(err);
            });
    });

    router.put('/users/:user/plugins/:plugin', function(req, res) {
        var user = req.params.user;
        var pluginId = req.params.plugin;
        var userOptions = req.body.userOptions;
        var pluginPackage = req.body.pluginPackage;
        var toUpdate = {};

        // validate body
        var errors = new Map();

        // user options
        if(userOptions !== undefined){
            if(!_.isPlainObject(userOptions)){
                errors.set('userOptions', 'Invalid options');
            }
            toUpdate.userOptions = userOptions;
        }

        // pluginPackage
        if (pluginPackage !== undefined) {
            toUpdate.pluginPackage = pluginPackage;
        }

        if(errors.size > 0){
            return res.badRequest(errors);
        }

        var where = { userId: user, id: pluginId };

        PluginsDao
            .findOne({
                where: where
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
        var id = req.body.id;
        var modules = req.body.modules || [];
        var version = req.body.version;
        var description = req.body.description;
        var name = req.body.name;
        var userId = parseInt(req.params.user);

        var plugin = {
            id: id,
            version: version,
            description: description,
            name: name,
            userId: userId,
            modules: modules
        };

        // check validity of module config
        //plugin.modules.forEach(function(moduleConfig) {
        //    if(["task", "trigger"].indexOf(moduleConfig.type) < 0) {
        //        return res.badRequest("The module config " + moduleConfig.type + " is not valid for plugin " + plugin.name);
        //    }
        //});

        // server.logger.verbose("Creating plugin with data %s", util.inspect(plugin));
        return PluginsDao.create(plugin)
            .then(function(created) {
                server.logger.verbose("Plugin \"%s\" created with id \"%s\" for user \"%s\"", created.name, created.id, created.userId);
                return res.created(created);
            })
            .catch(res.serverError);

    });

    /**
     * Fetch modules for a user.
     * You can filter modules by their types.
     */
    router.get('/users/:id/modules', function(req, res){
        PluginsDao
            .findAllModulesByUserId(req.params.id)
            .then(function(modules){
                if(!modules){
                    return res.badRequest("Invalid user id");
                }
                var tmp = modules
                    .filter(function(item){
                        return item.type === req.query.type;
                    })
                    .map(function(item){
                        item.pluginId = item.plugin.id;
                        return item;
                    });
                return res.ok(tmp);
            })
            .catch(res.serverError);
    });

    /**
     * Return the module detail from a user plugin
     * user : id
     * plugin : id
     * module : name
     */
    router.get('/users/:user/plugins/:plugin/modules/:module', function(req, res){
        PluginsDao
            .findAllPluginModulesByUserId(req.params.user, req.params.plugin)
            .then(function(modules){
                if(!modules){
                    return res.notFound('Invalid user or plugin id');
                }
                var module = modules.find(function(module){
                    return module.name === req.params.module;
                });
                if(module === undefined){
                    return res.notFound();
                }

                // format module
                // attach an attribute config for convenience and avoid having to go back to pluginPackage to retrieve module config.
                module.config = {
                    userOptions: module.plugin.pluginPackage.modules.find(function(tmp) {
                        return tmp.name === module.name;
                    }).options
                };

                return res.ok(module);
            })
            .catch(res.serverError);
    });

    /**
     *
     */
    // router.put('/users-modules/:id/options', function(req, res){
    //
    //     var id = req.params.id;
    //     var options = req.body.options;
    //
    //     var module = _.find(MyBuddy.userModules, function(entry){
    //         return  entry.id === id;
    //     });
    //
    //     if(module === undefined){
    //         return res.status(404).send();
    //     }
    //
    //     // update config
    //     var newOptions = _.merge(module.getUserOptions(), options);
    //
    //     // Update user config
    //     module.setAndSaveUserOptions(newOptions, function(err){
    //         if(err){
    //             return res.status(500).send(err);
    //         }
    //         return res.send();
    //     });
    // });

    return router;
};
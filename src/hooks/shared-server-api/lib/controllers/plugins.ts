'use strict';

let _ = require('lodash');
let validator = require('validator');
let util = require('util');
let request = require("request");

export = function(server, router) {

    let PluginsDao = server.orm.models.Plugins;

    router.get('/devices/:device/plugins/:plugin', function(req, res){
        let name = req.params.plugin;
        let deviceId = req.params.device;
        let search = {
            deviceId: deviceId,
            name: name
        };

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
            .catch(res.serverError);
    });

    router.delete("/devices/:device/plugins/:plugin", function(req, res) {
        let name = req.params.plugin;
        let deviceId = req.params.device;
        let query = {
            where: {
                name: name,
                deviceId: deviceId
            }
        };
        PluginsDao.destroy(query)
            .then(function(rows) {
                if (rows === 0) {
                    return res.notFound();
                }
                server.io.emit("plugin:deleted", { name: name, deviceId: deviceId });
                return res.ok();
            })
            .catch(res.serverError);
    });

    router.get('/devices/:device/plugins', function(req, res){
        PluginsDao
            .findAll({
                where: {
                    deviceId: req.params.device
                }
            })
            .then(function(plugins){
                return res.ok(plugins.map( item => item.toJSON() ));
            })
            .catch(res.serverError);
    });

    router.post("/devices/:device/plugins", function(req, res) {
        let version = req.body.version;
        let name = req.body.name;
        let repository = req.body.repository;
        let deviceId = req.params.device;
        let pluginPackage = req.body.package || {};

        // process.exit();
        // validation
        let errors = {};

        // Must contain a string as name
        if(!name || !validator.isLength(name, {min: 1})){
            errors['name'] = 'Name required or invalid';
        }

        if(!version){
            errors['version'] = 'version required or invalid';
        }

        if(!deviceId){
            errors['deviceId'] = 'deviceId required or invalid';
        }

        if(_.size(errors) > 0) {
            return res.badRequest({errors: errors});
        }

        let plugin = {
            version: version,
            name: name,
            deviceId: deviceId,
            "package": pluginPackage,
            repository: repository
        };

        return PluginsDao.create(plugin)
            .then(function(created) {
                server.logger.verbose("Plugin %s created with id %s for user %s", created.name, created.id, created.userId);
                server.io.emit("plugin:created", plugin);
                return res.created(created);
            })
            .catch(res.serverError);
    });

    router.put('/users/:user/plugins/:plugin', function(req, res) {
        let user = req.params.user;
        let pluginId = req.params.plugin;
        let userOptions = req.body.userOptions;
        let pluginPackage = req.body.pluginPackage;
        let toUpdate: any = {};

        // validate body
        let errors = new Map();

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

        let where = { userId: user, id: pluginId };

        PluginsDao
            .findOne({
                where: where
            })
            .then(function(plugin){
                if(!plugin){
                    return res.notFound();
                }

                return plugin.update(toUpdate).then(function(test){
                    // server.system.notificationService.push('success', util.format('The plugin %s options has been updated', plugin.name));
                    return res.ok(test.toJSON());
                });
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
                let module = modules.find(function(module){
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
     * Fetch modules for a user.
     * You can filter modules by their types.
     */
    router.get('/devices/:device/plugins-modules', function(req, res) {
        let modules = [];
        // @todo doit être dans la db interne
        // Get all plugin name
        PluginsDao.findAll()
            .then(function(plugins) {
                plugins.forEach(function(plugin) {
                    // let info = getPluginInfo(req, plugin.name);
                    let tmp = plugin.package.modules
                        .filter(function(item){
                            if (!req.query.type) {
                                return item;
                            }
                            return item.type === req.query.type;
                        })
                        .map(function(item){
                            item.plugin = plugin;
                            item.userOptions = plugin.userOptions[item.id];
                            return item;
                        });
                    modules = modules.concat(tmp);
                });

                return res.ok(modules);
            })
            .catch(res.serverError);
    });

    return router;
};
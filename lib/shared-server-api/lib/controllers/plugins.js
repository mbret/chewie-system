'use strict';
var _ = require('lodash');
var validator = require('validator');
var util = require('util');
let request = require("request");
module.exports = function (server, router) {
    var PluginsDao = server.orm.models.Plugins;
    router.get('/users/:user/plugins', function (req, res) {
        req.pipe(request({ uri: server.system.config.webServerRemoteUrl + "/api/plugins", strictSSL: false })).pipe(res);
    });
    router.get('/users/:user/plugins/:plugin', function (req, res) {
        req.pipe(request({ uri: server.system.config.webServerRemoteUrl + "/api/plugins/" + req.params.plugin, strictSSL: false })).pipe(res);
    });
    router.put('/users/:user/plugins/:plugin', function (req, res) {
        var user = req.params.user;
        var pluginId = req.params.plugin;
        var userOptions = req.body.userOptions;
        var pluginPackage = req.body.pluginPackage;
        var toUpdate = {};
        var errors = new Map();
        if (userOptions !== undefined) {
            if (!_.isPlainObject(userOptions)) {
                errors.set('userOptions', 'Invalid options');
            }
            toUpdate.userOptions = userOptions;
        }
        if (pluginPackage !== undefined) {
            toUpdate.pluginPackage = pluginPackage;
        }
        if (errors.size > 0) {
            return res.badRequest(errors);
        }
        var where = { userId: user, id: pluginId };
        PluginsDao
            .findOne({
            where: where
        })
            .then(function (plugin) {
            if (!plugin) {
                return res.notFound();
            }
            return plugin.update(toUpdate).then(function (test) {
                return res.ok(test.toJSON());
            });
        })
            .catch(function (err) {
            return res.serverError(err);
        });
    });
    router.post("/users/:user/plugins", function (req, res) {
        let version = req.body.version;
        let name = req.body.name;
        let repository = req.body.repository;
        let userId = parseInt(req.params.user);
        let pluginPackage = req.body.package || {};
        let errors = {};
        if (!name || !validator.isLength(name, { min: 1 })) {
            errors['name'] = 'Name required or invalid';
        }
        if (!version) {
            errors['version'] = 'version required or invalid';
        }
        if (!userId) {
            errors['userId'] = 'userId required or invalid';
        }
        if (_.size(errors) > 0) {
            return res.badRequest({ errors: errors });
        }
        let plugin = {
            version: version,
            name: name,
            userId: userId,
            "package": pluginPackage,
            repository: repository
        };
        return PluginsDao.create(plugin)
            .then(function (created) {
            server.logger.verbose("Plugin \"%s\" created with id \"%s\" for user \"%s\"", created.name, created.id, created.userId);
            server.io.emit("user:plugin:created", plugin);
            return res.created(created);
        })
            .catch(res.serverError);
    });
    router.delete("/users/:user/plugins/:plugin", function (req, res) {
        var userId = parseInt(req.params.user);
        var name = req.params.plugin;
        var query = {
            where: {
                userId: userId,
                name: name
            }
        };
        PluginsDao.destroy(query)
            .then(function (rows) {
            if (rows === 0) {
                return res.notFound();
            }
            server.io.emit("user:plugin:deleted", { name: name, userId: userId });
            return res.ok();
        })
            .catch(res.serverError);
    });
    router.get('/users/:user/plugins/:plugin/modules/:module', function (req, res) {
        PluginsDao
            .findAllPluginModulesByUserId(req.params.user, req.params.plugin)
            .then(function (modules) {
            if (!modules) {
                return res.notFound('Invalid user or plugin id');
            }
            var module = modules.find(function (module) {
                return module.name === req.params.module;
            });
            if (module === undefined) {
                return res.notFound();
            }
            module.config = {
                userOptions: module.plugin.pluginPackage.modules.find(function (tmp) {
                    return tmp.name === module.name;
                }).options
            };
            return res.ok(module);
        })
            .catch(res.serverError);
    });
    return router;
};

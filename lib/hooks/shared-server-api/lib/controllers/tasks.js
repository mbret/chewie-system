'use strict';
var _ = require('lodash');
var validator = require('validator');
var util = require('util');
var Errors = require("./../errors");
module.exports = function (server, router) {
    var PluginsDao = server.orm.models.Plugins;
    var TasksDao = server.orm.models.Task;
    var UserDao = server.orm.models.User;
    router.get('/users/:user/plugins/:plugin/modules/:module/tasks/:task', function (req, res) {
        var userId = parseInt(req.params.user);
        var name = req.params.task;
        var moduleId = req.params.module;
        var where = {
            userId: userId,
            name: name,
            moduleId: moduleId
        };
        TasksDao
            .findOne({
            where: where
        })
            .then(function (task) {
            if (!task) {
                return res.notFound();
            }
            return res.ok(task.toJSON());
        })
            .catch(res.serverError);
    });
    router.get('/users/:user/tasks', function (req, res) {
        var userId = parseInt(req.params.user);
        var where = {
            userId: userId,
        };
        TasksDao
            .findAll({
            where: where
        })
            .then(function (tasks) {
            return res.ok(TasksDao.toJSON(tasks));
        })
            .catch(res.serverError);
    });
    router.post('/users/:user/plugins/:plugin/modules/:module/tasks', function (req, res) {
        var moduleId = req.params.module;
        var userId = req.params.user;
        var pluginId = req.params.plugin;
        var data = req.body || {};
        var task = {};
        var errors = {};
        if (!_.isObject(data)) {
            errors['task'] = 'Invalid object';
            return res.badRequest({ errors: errors });
        }
        if (data.options && !_.isObject(data.options)) {
            errors['task.options'] = 'Invalid options';
        }
        if (!data.name || !validator.isLength(data.name, { min: 0 })) {
            errors['name'] = 'Name required or invalid';
        }
        if (_.size(errors) > 0) {
            return res.badRequest({ errors: errors });
        }
        task.name = data.name;
        task.description = data.description;
        task.options = data.options || {};
        UserDao.findByIdOrUsername(userId)
            .then(function (user) {
            if (!user) {
                throw new Errors.BadRequestError("The user " + userId + " does not exist");
            }
            return PluginsDao.findByIdOrName(pluginId)
                .then(function (plugin) {
                if (!plugin) {
                    throw new Errors.BadRequestError("The plugin " + pluginId + " does not exist");
                }
                if (!plugin.hasModule(moduleId)) {
                    throw new Errors.BadRequestError("The module " + moduleId + " does not exist for plugin " + plugin.name);
                }
                task.userId = user.id;
                task.pluginId = plugin.name;
                task.moduleId = moduleId;
                server.logger.debug('The task being created looks like %s', JSON.stringify(task));
                return new Promise(function (resolve, reject) {
                    TasksDao.create(task)
                        .then(function (createdTask) {
                        return resolve(createdTask.toJSON());
                    })
                        .catch(function (err) {
                        if (err.name = "SequelizeUniqueConstraintError") {
                            err = new Errors.BadRequestError("A task with the name '" + task.name + "' already exist");
                        }
                        return reject(err);
                    });
                }).then(function (task) {
                    server.logger.verbose("Task %d created", task.id);
                    setImmediate(function () {
                        server.system.bus.emit('task:created', task);
                    });
                    return res.created(task);
                });
            });
        })
            .catch(function (err) {
            if (err.BadRequestError) {
                return res.badRequest(err);
            }
            return res.serverError(err);
        });
    });
    router.put('/users/:user/tasks/:task', function (req, res) {
        var taskId = req.params.task;
        var userId = req.params.user;
        var active = req.body.active;
        var toUpdate = {};
        var errors = new Map();
        if (active !== undefined) {
            if (!(typeof active === "boolean")) {
                errors.set('active', 'Invalid');
            }
            toUpdate.active = active;
        }
        if (errors.size > 0) {
            return res.badRequest(errors);
        }
        TasksDao.findOne({ where: { id: taskId, userId: userId } })
            .then(function (task) {
            if (!task) {
                return res.notFound();
            }
            return task.update(toUpdate).then(function () {
                return res.updated(task.toJSON());
            });
        })
            .catch(function (err) {
            return res.serverError(err);
        });
    });
    return router;
};

'use strict';

var _ = require('lodash');
var validator = require('validator');
var util = require('util');
var Errors = require(LIB_DIR + "/api-server/lib/errors");

module.exports = function(server, router) {

    var PluginsDao = server.orm.models.Plugins;
    var TasksDao = server.orm.models.Task;
    var notificationsService = server.services.get('NotificationsService');
    var UserDao = server.orm.models.User;
    
    router.get('/users/:user/plugins/:plugin/modules/:module/tasks/:task', function(req, res) {

        // integer
        var userId = parseInt(req.params.user);
        // string
        var name = req.params.task;
        // string
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
            .then(function(task){
                if (!task) {
                    return res.notFound();
                }
                return res.ok(task.toJSON());
            })
            .catch(res.serverError);
    });

    /**
     * It could make sens to retrieve all tasks for a user.
     */
    router.get('/users/:user/tasks', function(req, res) {

        // integer
        var userId = parseInt(req.params.user);
        var where = {
            userId: userId,
        };

        TasksDao
            .findAll({
                where: where
            })
            .then(function(tasks){
                return res.ok(TasksDao.toJSON(tasks));
            })
            .catch(res.serverError);
    });

    router.delete('users/:user/tasks/:id', function(req, res){

        var taskId  = req.params.id;

        if(validator.isNull(taskId)){
            return res.status(400).send('Not a valid id');
        }

        var userModulesTasks = MyBuddy.tasks.userModules;

        var task = null;
        _.forEach(userModulesTasks, function(tmp){
            if(tmp.id === taskId){
                task = tmp;
            }
        });

        if(task === null){
            return res.status(400).send('This id does not exist');
        }

        // ModuleHandler.deleteTask(task);

        return res.status(200).send();
    });

    /**
     * Create a new task
     *
     * {
     *      name: "My task",
     *      options: {},
     * }
     */
    router.post('/users/:user/plugins/:plugin/modules/:module/tasks', function(req, res){

        var moduleId = req.params.module;
        var userId = req.params.user;
        var pluginId = req.params.plugin;
        var data = req.body || {};
        var task = {};

        // normalize data
        data.triggers = data.triggers || [];

        // Check params
        var errors = {};

        // Check global object
        if(!_.isObject(data)){
            errors['task'] = 'Invalid object';
            return res.badRequest({errors: errors});
        }

        // Task global options should be key:value
        if(data.options && !_.isObject(data.options)){
            errors['task.options'] = 'Invalid options';
        }

        // Task must contain a name as string
        if(!data.name || !validator.isLength(data.name, {min: 0})){
            errors['name'] = 'Name required or invalid';
        }

        if(!Array.isArray(data.triggers)){
            errors['triggers'] = 'Invalid triggers format';
        }

        // Check all triggers
        // Triggers are array of literal objects
        _.forEach(data.triggers, function(trigger, index){
            var errorLabel = 'task.trigger[' + index + ']';

            // Must be an object
            if(!_.isObject(trigger)){
                errors[errorLabel] = 'Invalid object';
                return;
            }

            // check trigger type
            if(!trigger.type || ['direct', 'trigger', 'schedule'].indexOf(trigger.type) === -1){
                errors[errorLabel + '.type'] = 'Unknown type';
            }

            // check trigger options
            if(trigger.options && !_.isObject(trigger.options)){
                errors[errorLabel] = 'Invalid options';
            }

            // check trigger actions
            if(trigger.outputAdapters){
                if(!Array.isArray(trigger.outputAdapters)){
                    errors[errorLabel + '.outputAdapters'] = 'Invalid outputAdapters';
                }
            }

            // check trigger of type 'trigger'
            if(trigger.type === 'trigger'){

                if(!_.isObject(trigger.trigger)){
                    errors[errorLabel + '.trigger'] = 'No trigger trigger object provided'
                }
                else{
                    // check options
                    if(trigger.trigger.options && !_.isObject(trigger.options)){
                        errors[errorLabel + '.trigger.options'] = 'Invalid options';
                    }
                }
            }
        });

        console.log("coucou",errors);
        if(_.size(errors) > 0){
            return res.badRequest({errors: errors});
        }

        // add manual trigger
        data.triggers.push({
            type: "manual",
            options: {}
        });

        // Create final task to create
        task.name       = data.name;
        task.description = data.description;
        task.options    = data.options || {};
        task.triggers   = data.triggers;

        // Now try to retrieve user plugin and module to make sure they exist

        // retrieve user
        UserDao.findByIdOrUsername(userId)
            .then(function(user) {
                if(!user) {
                    throw new Errors.BadRequestError("The user " + userId + " does not exist");
                }

                // retrieve plugin
                return PluginsDao.findByIdOrName(pluginId)
                    .then(function(plugin) {
                        if(!plugin) {
                            throw new Errors.BadRequestError("The plugin " + pluginId + " does not exist");
                        }

                        // check module
                        if(!plugin.hasModule(moduleId)) {
                            throw new Errors.BadRequestError("The module " + moduleId + " does not exist for plugin " + plugin.name);
                        }

                        task.userId = user.id;
                        task.pluginId = plugin.id;
                        task.moduleId = moduleId;

                        server.logger.debug('The task being created looks like %s', JSON.stringify(task));

                        return new Promise(function(resolve, reject){
                            // When direct return task
                            // we do not save it
                            // if(TasksDao.isDirect(task)){
                            //     server.logger.debug('Direct task, not saved');
                            //     return resolve(task);
                            // }
                            // else{
                                // Otherwise, create and save task and return the
                                // created one.
                                TasksDao.create(task)
                                    .then(function(createdTask){
                                        return resolve(createdTask.toJSON());
                                    })
                                    .catch(function(err) {
                                        if(err.name = "SequelizeUniqueConstraintError") {
                                            err = new Errors.BadRequestError("A task with the name '" + task.name + "' already exist");
                                        }
                                        return reject(err);
                                    });
                            // }
                        }).then(function(task){
                            server.logger.verbose("Task %d created", task.id);
                            // register new task event + avoid generate error during request
                            setImmediate(function(){
                                server.system.bus.emit('task:created', task);
                            });

                            return res.created(task);
                        });
                    });
            })
            .catch(function(err) {
                if(err.BadRequestError) {
                    return res.badRequest(err);
                }
                return res.serverError(err);
            });
    });

    /**
     * Update a given task
     */
    router.put('/users/:user/tasks/:task', function(req, res){
        var taskId = req.params.task;
        var userId = req.params.user;
        var active = req.body.active;
        var toUpdate = {};

        // validate body
        var errors = new Map();
        if(active !== undefined){
            if(!(typeof active === "boolean")){
                errors.set('active', 'Invalid');
            }
            toUpdate.active = active;
        }

        if(errors.size > 0){
            return res.badRequest(errors);
        }

        TasksDao.findOne({where: {id: taskId, userId: userId}})
            .then(function(task){
                if(!task){
                    return res.notFound();
                }

                return task.update(toUpdate).then(function(){
                    notificationsService.push(req, 'success', util.format('The task %s has been updated', task.get('name')));
                    return res.updated(task.toJSON());
                });
            })
            .catch(function(err){
                return res.serverError(err);
            });
    });

    return router;
};
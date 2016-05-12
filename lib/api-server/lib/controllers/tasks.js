'use strict';

var _           = require('lodash');
var validator   = require('validator');
var util = require('util');

module.exports = function(server, router){

    var ModuleHandler = require(CORE_DIR + '/plugins/task-modules/module-handler.js');
    var PluginsDao = server.system.orm.models.Plugins;
    var TasksDao = server.system.orm.models.Task;
    var notificationsService = server.services.get('NotificationsService');

    router.get('/users/:user/tasks', function(req, res){

        var userId = req.params.user;
        var tasks = [];

        TasksDao
            .findAll({
                where: {
                    userId: userId
                }
            })
            .then(function(tasks){
                return res.status(200).send(TasksDao.toJSON(tasks));
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });
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

        ModuleHandler.deleteTask(task);

        return res.status(200).send();
    });

    /**
     * Create a new task
     */
    router.post('/users/:user/tasks', function(req, res){

        var data      = req.body;
        var task      = {};

        console.log(data);

        // Check params
        var errors = {};

        // Check global object
        if(!_.isObject(data)){
            errors['task'] = 'Invalid object';
            return res.status(400).send({errors: errors});
        }

        // Task global options should be key:value
        if(data.options && !_.isObject(data.options)){
            errors['task.options'] = 'Invalid options';
        }

        // Task must contain a name as string
        if(!validator.isLength(data.name, {min: 0})){
            errors['name'] = 'Name required or invalid';
        }

        // Task must have at least one trigger (as an array)
        if(!Array.isArray(data.triggers) || data.triggers.length === 0){
            errors['triggers'] = 'At least one trigger is required';
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
            if(!trigger.type || ['direct', 'manual', 'trigger', 'schedule'].indexOf(trigger.type) === -1){
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

        if(_.size(errors) > 0){
            return res.status(400).send({errors: errors});
        }

        // Create final task to create
        task.module     = data.module;
        task.name       = data.name;
        task.description = data.description;
        task.options    = data.options || {};
        task.triggers   = data.triggers;
        task.userId     = req.params.user;

        server.logger.debug('The task being created looks like %s', JSON.stringify(task));

        // First check if the module and the plugin exist
        // for this user
        var ids = data.module.split(':');
        PluginsDao.hasModule(req.params.user, ids[0], ids[1])
            .then(function(module){
                if(!module){
                    return res.status(400).send('Invalid module');
                }

                return new Promise(function(resolve, reject){
                    // When direct return task
                    // we do not save it
                    if(TasksDao.isDirect(task)){
                        server.logger.debug('Direct task, not saved');
                        return resolve(task);
                    }
                    else{
                        // Otherwise, create and save task and return the
                        // created one.
                        TasksDao.create(task)
                            .then(function(task){
                                return resolve(task.toJSON());
                            })
                            .catch(reject);
                    }
                }).then(function(task){
                    // register new task event + avoid generate error during request
                    setImmediate(function(){
                        server.system.bus.emit('task:created', task);
                    });
                });
            })
            .then(function(task){
                return res.status(201).send(task);
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
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
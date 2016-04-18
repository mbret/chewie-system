'use strict';

var _           = require('lodash');
var validator   = require('validator');
var Task        = require(CORE_DIR + '/plugins/tasks/task.js');

module.exports = function(server, router){

    var ModuleHandler = require(CORE_DIR + '/plugins/task-modules/module-handler.js');
    var PluginsDao = server.system.orm.models.Plugins;
    var TasksDao = server.system.orm.models.Task;

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

    router.post('/users/:user/tasks', function(req, res){

        var data      = req.body;
        var task      = {};

        // Check params
        var errors = {};

        if(!_.isObject(data)){
            errors['task'] = 'Invalid object';
            return res.status(400).send({errors: errors});
        }

        if(data.options && !_.isObject(data.options)){
            errors['task.options'] = 'Invalid options';
        }

        if(!validator.isLength(data.name, {min: 0})){
            errors['name'] = 'Name required or invalid';
        }

        if(!Array.isArray(data.triggers) || data.triggers.length === 0){
            errors['triggers'] = 'At least one trigger is required';
        }

        // Check all triggers
        _.forEach(data.triggers, function(trigger, index){
            var errorLabel = 'task.trigger[' + index + ']';
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
        task.options    = data.options || {};
        task.triggers   = data.triggers;
        task.userId     = req.params.user;

        console.log(task);

        // First check if the module and the plugin exist
        // for this user
        var ids = data.module.split(':');
        PluginsDao.hasModule(req.params.user, ids[0], ids[1])
            .then(function(module){
                if(!module){
                    return res.status(400).send('Invalid module');
                }

                // When direct return task
                // we do not save it
                if(TasksDao.isDirect(task)){
                    server.logger.debug('Direct task, not saved');
                    return task;
                }

                // Otherwise, create task and return the
                // created one.
                return TasksDao.create(task);
            })
            .then(function(task){

                // Run task if a profile is loaded
                // No need to be sync, task is ran in background
                if(server.system.profileManager.hasActiveProfile()){
                    var newTask = Task.Build(server.system, task.toJSON());
                    server.system.moduleHandler.registerTask(newTask, function(err){
                        if(err){
                            console.error(err);
                        }
                    });
                }

                return res.status(201).send(task.toJSON());
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });

    });

    router.put('/users/:user/tasks/:task', function(req, res){

    });

    return router;
};
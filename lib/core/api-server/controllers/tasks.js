'use strict';

var _           = require('lodash');
var validator   = require('validator');
var Task        = require(CORE_DIR + '/plugins/tasks/task.js');

module.exports = function(server, router){

    var self = this;
    var ModuleHandler = require(CORE_DIR + '/plugins/task-modules/module-handler.js');

    /**
     * Return all tasks
     */
    router.get('/tasks', function(req, res){

        var tasks = [];

        _.forEach(server.daemon.tasks.userModules, function(task){
            tasks.push(task.toJSON());
        });

        return res.send(tasks);
    });

    /**
     *
     */
    router.delete('/tasks/:id', function(req, res){

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
     * Add a task for a module.
     */
    router.post('/users-modules/:module/tasks/', function(req, res){

        var moduleId  = req.params.module;
        var data      = req.body;
        var task      = {};

        // check module id
        if(!self.daemon.pluginsHandler.hasTaskModule(moduleId)){
            return res.status(404);
        }

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
            if(!trigger.type || ['direct', 'manual', 'trigger'].indexOf(trigger.type) === -1){
                errors[errorLabel + '.type'] = 'Unknown type';
            }

            // check trigger options
            if(trigger.options && !_.isObject(trigger.options)){
                errors[errorLabel] = 'Invalid options';
            }

            // check trigger actions
            if(trigger.messageAdapters){
                if(!Array.isArray(trigger.messageAdapters)){
                    errors[errorLabel + '.messageAdapters'] = 'Invalid messageAdapters';
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
        task.moduleId   = moduleId;
        task.name       = data.name;
        task.options    = data.options || {};
        task.triggers   = data.triggers;

        var newTask = Task.Build(self.daemon, task);
        self.daemon.moduleHandler.registerAndSaveTask(newTask, function(err){
            if(err){
                return res.status(500).send('Unable to execute the task');
            }
            return res.send();
        });
    });

    return router;
};
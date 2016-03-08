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
        var task        = req.body;

        // check module id
        if(!self.daemon.pluginsHandler.hasTaskModule(moduleId)){
            return res.status(404);
        }

        // Check params
        var errors = {};

        if(!_.isObject(task)){
            errors['task'] = 'Invalid object';
            return res.status(400).send({errors: errors});
        }

        if(!validator.isLength(task.name, {min: 0})){
            errors['name'] = 'Name required or invalid';
        }

        if(!Array.isArray(task.triggers) || task.triggers.length === 0){
            errors['triggers'] = 'At least one trigger is required';
        }

        if(_.size(errors) > 0){
            return res.status(400).send({errors: errors});
        }

        task.moduleId = moduleId;
        console.log(task);

        return res.status(200).send();


        var newTask = Task.Build(task, type);
        MyBuddy.moduleHandler.registerAndSaveNewTask(newTask, function(err){
            if(err){
                return res.status(500).send('Unable to execute the task');
            }
            return res.send();
        });
    });

    return router;
};
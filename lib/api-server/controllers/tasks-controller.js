'use strict';

var _ = require('lodash');
var validator = require('validator');
var ModuleHandler = require(LIB_DIR + '/modules/module-handler.js');
var Tasks           = require(LIB_DIR + '/plugins/tasks/task.js');
var Task            = Tasks.Task;
var DirectTask      = Tasks.DirectTask;
var CommandedTask   = Tasks.CommandedTask;
var ScheduledTask   = Tasks.ScheduledTask;

module.exports = function(server, router){

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

    return router;
};
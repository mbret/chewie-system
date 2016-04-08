'use strict';

var util = require('util');
var Task = require(CORE_DIR + '/plugins/tasks').Task;

module.exports = function(server, router){

    var UserDao = server.system.orm.models.User;
    var TaskDao = server.system.orm.models.Task;

    router.get('/runtime/profile', function(req, res){
        var profile = server.system.profileManager.getActiveProfile();
        if(profile === null){
            return res.status(404).send();
        }
        return res.status(200).send(profile);
    });

    router.post('/runtime/profile', function(req, res){
        var id = req.body.id;

        UserDao.findById(id)
            .then(function(user){
                if(!user){
                    return res.status(400).send('invalid user id');
                }
                return server.system.profileManager.startProfile(id);
            })
            .then(function(){
                server.system.notificationService.push('success', 'Profile started');
                return res.status(201).send();
            })
            .catch(function(err){
                server.system.notificationService.push('error', 'Profile failed to start');
                res.status(500).send(err.stack);
            });
    });

    router.delete('/runtime/profile', function(req, res){

        return server.system.profileManager.stopProfile()
            .then(function(){
                server.system.notificationService.push('success', 'Profile stopped');
                res.status(200).send();
            })
            .catch(function(err){
                server.system.notificationService.push('error', 'Profile failed to stop');
                res.status(500).send(err.stack);
            });
    });

    router.get('/runtime/tasks', function(req, res){
        var tasks = [];
        server.system.tasks.forEach(function(task){
            tasks.push(task.toJSON());
        });

        return res.status(200).send(tasks);
    });

    router.delete('/runtime/tasks/:id', function(req, res){
        var taskId = req.params.id;
        taskId = taskId ? parseInt(taskId) : null;

        server.system.runtimeHelper.stopTask(taskId)
            .then(function(){
                return res.ok();
            })
            .catch(function(err){
                server.system.notificationService.push('error', util.format('Failed to stop the task %s, see logs for more details', taskId));
                return res.serverError(err);
            });
    });

    router.post('/runtime/tasks', function(req, res){

        TaskDao.findById(req.body.id)
            .then(function(data){
                if(!data){
                    res.badRequest();
                }

                server.system.runtimeHelper.registerTask(Task.Build(server.system, data), function(err){
                    if(err){
                        return res.serverError(err);
                    }

                    server.system.notificationService.push('success', util.format('Task %s is now running', data.id));
                    return res.ok();
                });
            })
            .catch(res.serverError);

    });
};
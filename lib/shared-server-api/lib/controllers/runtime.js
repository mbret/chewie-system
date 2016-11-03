'use strict';
var util = require('util');
module.exports = function (server, router) {
    var UserDao = server.orm.models.User;
    var TaskDao = server.orm.models.Task;
    /**
     * Reject all request method except OPTIONS when no active profile exist.
     */
    router.all("/runtime/tasks*", function (req, res, next) {
        if (req.method === "OPTIONS" || server.system.runtimeHelper.hasActiveProfile()) {
            return next();
        }
        return res.badRequest({ code: "noActiveProfile" });
    });
    router.get('/runtime/profile', function (req, res) {
        var profile = server.system.runtimeHelper.profile.getActiveProfile();
        if (profile === null) {
            return res.status(404).send();
        }
        return res.status(200).send(profile);
    });
    router.post('/runtime/profile', function (req, res) {
        var id = req.body.id;
        UserDao.findById(id)
            .then(function (user) {
            if (!user) {
                return res.status(400).send('invalid user id');
            }
            return server.system.profileManager.startProfile(user.username);
        })
            .then(function () {
            server.system.notificationService.push('success', 'Profile started');
            return res.status(201).send();
        })
            .catch(function (err) {
            server.system.notificationService.push('error', 'Profile failed to start');
            res.status(500).send(err.stack);
        });
    });
    router.delete('/runtime/profile', function (req, res) {
        return server.system.profileManager.stopProfile()
            .then(function () {
            server.system.notificationService.push('success', 'Profile stopped');
            res.status(200).send();
        })
            .catch(function (err) {
            server.system.notificationService.push('error', 'Profile failed to stop');
            res.status(500).send(err.stack);
        });
    });
    /**
     * Get the list of running tasks.
     */
    // router.get('/runtime/tasks', function(req, res){
    //     var tasks = [];
    //     server.system.tasks.forEach(function(task){
    //         tasks.push(task.toJSON());
    //     });
    //
    //     return res.status(200).send(tasks);
    // });
    /**
     *
     */
    // router.put("/runtime/profile/tasks/:id", function(req, res) {
    //     var taskId = req.params.id ? parseInt(req.params.id) : null;
    //     var active = req.body.active;
    //
    //     // filters
    //     active = active === undefined ? null : active;
    //
    //     // check active
    //     if (active !== null && typeof active !== "boolean") {
    //         return res.badRequest("Invalid active");
    //     }
    //
    //     // check if task exist
    //     TaskDao.findById(taskId)
    //         .then(function(task) {
    //             if (!task) {
    //                 return res.notFound("Task not found");
    //             }
    //
    //             console.log(active, server.system.tasks.has(taskId));
    //             // activate the task (start it)
    //             if (active !== null && active && !server.system.tasks.has(taskId)) {
    //                 // Register the new task in runtime
    //                 server.system.runtimeHelper.registerTask(task, function(err){
    //                     if(err){
    //                         return res.serverError(err);
    //                     }
    //
    //                     server.system.notificationService.push('success', util.format('The task %s is now running', taskId));
    //                     return res.ok();
    //                 });
    //             }
    //             // deactivate the task (stop it)
    //             else if (active !== null && !active && server.system.tasks.has(taskId)) {
    //                 server.system.runtimeHelper.unregisterTask(taskId)
    //                     .then(function(){
    //                         server.system.notificationService.push('success', util.format('The task %s has been stopped', taskId));
    //                         return res.ok();
    //                     })
    //                     .catch(function(err){
    //                         server.system.notificationService.push('error', util.format('Failed to stop the task %s, see logs for more details', taskId));
    //                         return res.serverError(err);
    //                     });
    //             }
    //             else {
    //                 return res.ok();
    //             }
    //         })
    //         .catch(res.serverError);
    // });
    /**
     * Execute a task
     */
    router.post("/runtime/tasks/:task", function (req, res) {
        var id = parseInt(req.params.task);
        // check task
        TaskDao.findById(id)
            .then(function (task) {
            if (!task) {
                return res.notFound();
            }
            // execute the task
            server.system.runtimeHelper.executeTask(task);
            return res.created();
        })
            .catch(res.serverError);
    });
    router.get("/runtime/executing-tasks", function (req, res) {
        var tasks = [];
        server.system.executingTasks.forEach(function (tmp) {
            tasks.push(tmp);
        });
        return res.ok(server.services.taskService.taskExecutionToJson(tasks));
    });
    router.delete("/runtime/executing-tasks/:execution", function (req, res) {
        var id = req.params.execution;
        var executingTask = server.system.executingTasks.get(id);
        if (!executingTask) {
            return res.notFound();
        }
        // stop
        server.system.runtimeHelper.stopTask(executingTask);
        return res.ok();
    });
    /**
     * Execute a task for one of its trigger
     * - This may be used to execute a task once (with manual trigger)
     */
    // router.post('/runtime/tasks/:task/triggers/:trigger', function(req, res){
    //     var taskId = req.params.task ? parseInt(req.params.task) : null;
    //     var triggerId = req.params.trigger;
    //
    //     // Check if task exist
    //     TaskDao.findById(taskId)
    //         .then(function(task) {
    //             if (!task) {
    //                 return res.notFound();
    //             }
    //
    //             // Now take runtime task
    //             task = server.system.tasks.get(task.id);
    //
    //             // now take the trigger
    //             // if no trigger provided use manual trigger
    //             return Promise.resolve()
    //                 .then(function() {
    //                     if (!triggerId) {
    //                         return new ManualTaskTrigger(server.system, task, "FAKE-id", {});
    //                     } else {
    //                         return task.triggers.get(triggerId);
    //                     }
    //                 })
    //                 .then(function(trigger) {
    //                     if (!trigger) {
    //                         return res.notFound("trigger not found");
    //                     }
    //                     server.system.runtimeHelper.executeTask(task, trigger);
    //                     server.system.notificationService.push('info', util.format('Task %s started manually', task.name));
    //                     server.logger.debug('Task %s with id %s started manually with trigger id %s', task.name, task.id, trigger.id);
    //
    //                     return res.ok();
    //                 });
    //         })
    //         .catch(res.serverError);
    // });
    /**
     *
     */
    router.get("/runtime/scenarios", function (req, res) {
        var scenarios = [];
        server.system.runtime.scenarios.forEach(function (value) {
            scenarios.push(value);
        });
        return res.ok(scenarios);
    });
};

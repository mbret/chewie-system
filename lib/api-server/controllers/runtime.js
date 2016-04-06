'use strict';

module.exports = function(server, router){

    var UserDao = server.system.orm.models.User;

    router.get('/runtime/tasks', function(req, res){
        var tasks = [];
        server.system.tasks.forEach(function(task){
            tasks.push(task.toJSON());
        });

        return res.status(200).send(tasks);
    });

    router.delete('/runtime/tasks/:id', function(req, res){
        var taskId = req.params.id;
        server.system.runtimeHelper.stopTask(taskId)
            .then(function(){

            })
            .catch(function(err){

            });
    });

    return router;
};
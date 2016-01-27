'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    router.get('/tasks', function(req, res){

        //var tasks = {};
        var tasks = [];

        //_.forEach(server.daemon.tasks.userModules, function(task){
        //    if(!tasks[task.module]){
        //        tasks[task.module] = [];
        //    }
        //    tasks[task.module].push({
        //        schedule: task.schedule,
        //        options: task.options,
        //        messageAdapters: task.messageAdapters,
        //        id: task._id
        //    });
        //});

        _.forEach(server.daemon.tasks.userModules, function(task){
            tasks.push(task.toJSON());
        });

        return res.send(tasks);
    });

    return router;
};
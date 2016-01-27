'use strict';

var _ = require('lodash');
var Task = require(LIB_DIR + '/modules/task.js').Task;

module.exports = function(server, router){

    /**
     * Add a task to a module
     */
    router.post('/users-modules/:module/tasks/', function(req, res){

        var moduleName  = req.params.module;
        var task        = req.body.task;
        var type        = req.body.type;

        task.module = moduleName;

        try{
            var task = Task.Build(req.body.task, type);
        }
        catch(err){
            if(err.code === Task.ERROR_CODE.INVALID || err.code === Task.ERROR_CODE.UNKNOWN_TYPE){
                return res.status(400).send(err.message);
            }
            return res.status(500).send(err.message);
        }

        // Register the task
        server.daemon.registerUserTask(task, function(err){
            if(err){
                return res.status(500).send('Unable to execute the task');
            }
            return res.send();
        });
    });

    router.get('/users-modules', function(req, res){
        var modules = server.daemon.userModules;
        var tmp = [];
        _.forEach(modules, function(module, name){
            var moduleConfig = module.getConfig();
            tmp.push({
                name: name,
                options: moduleConfig.options ? moduleConfig.options : [],
                module: null
            });
        });

        return res.send(tmp);
    });

    return router;
};
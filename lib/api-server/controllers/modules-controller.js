'use strict';

var _ = require('lodash');
var Task = require(LIB_DIR + '/plugins/tasks/task.js').Task;

module.exports = function(server, router){

    /**
     * Add a task for a module.
     */
    router.post('/users-modules/:module/tasks/', function(req, res){

        var moduleName  = req.params.module;
        var task        = req.body.task;
        var type        = req.body.type;

        task.module = moduleName;

        // First check the task validity
        try{
            checkTask(task, type);
        }
        catch(err){
            if(err.code === Task.ERROR_CODE.INVALID || err.code === Task.ERROR_CODE.UNKNOWN_TYPE){
                return res.status(400).send(err.message);
            }
            return res.status(500).send(err.message);
        }

        var newTask = Task.Build(task, type);
        MyBuddy.moduleHandler.registerNewTask(newTask, function(err){
            if(err){
                return res.status(500).send('Unable to execute the task');
            }
            return res.send();
        });
    });

    /**
     * Return all the users modules.
     */
    router.get('/users-modules', function(req, res){
        var modules = MyBuddy.userModules;
        var tmp = [];

        _.forEach(modules, function(module, name){
            var moduleConfig = module.getConfig();
            tmp.push({
                name: name,
                config: moduleConfig,
                module: null
            });
        });

        return res.send(tmp);
    });

    /**
     * Check the task from request.
     * @param task
     * @param type
     * @returns {Task}
     */
    function checkTask(task, type){

        var err = new Error('Invalid schedule');
        err.code = Task.ERROR_CODE.INVALID;

        switch(type){
            case 'movement-command':
            case 'MovementCommandedTask':
            case 'command':
            case 'CommandedTask':
                break;

            case 'ScheduledTask':
                if(!task.schedule || !task.schedule.method){
                    throw err;
                }
                break;

            case 'direct':
            case 'DirectTask':
            default:
                break;
        }
    }

    return router;
};
'use strict';

var _ = require('lodash');
var validator = require('validator');
var ModuleHandler = require(LIB_DIR + '/plugins/task-modules/module-handler.js');
var Task           = require(LIB_DIR + '/plugins/tasks/task.js');
var DirectTask      = require(LIB_DIR + '/plugins/tasks/direct-task.js');
var TriggeredTask   = require(LIB_DIR + '/plugins/tasks/triggered-task.js');
var ScheduledTask   = require(LIB_DIR + '/plugins/tasks/scheduled-task.js');

module.exports = function(server, router){

    /**
     * Check the task from request.
     * @param task
     * @param type
     * @returns {Task}
     */
    function checkTask(task, type){

        var err = new Error('Invalid schedule');
        err.code = 'INVALID';

        switch(type){
            case 'trigger':
                if(!task.triggerOptions || !task.trigger){
                    throw err;
                }
                break;

            case 'ScheduledTask':
                if(!task.schedule || !task.schedule.method){
                    throw err;
                }
                break;

            case 'direct':
            case 'DirectTask':
                // ok
                break;

            default:
                throw err;
                break;
        }
    }

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

        var moduleName  = req.params.module;
        var task        = req.body.task;
        var type        = req.body.type;

        task.module = moduleName;

        // First check the task validity
        try{
            checkTask(task, type);
        }
        catch(err){
            if(err.code === 'INVALID'){
                return res.status(400).send(err.message);
            }
            return res.status(500).send(err.message);
        }

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
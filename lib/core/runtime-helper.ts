'use strict';

var _ = require('lodash');
var tasks = require(CORE_DIR + "/plugins/tasks");
import {Task} from "./plugins/tasks/index";
import {Daemon} from "../daemon";
import {TaskExecution} from "./plugins/tasks/task-execution";
var taskQueue = require('my-buddy-lib').taskQueue;
var ProfileManager = require(CORE_DIR + '/profile-manager');
var util = require("util");

class RuntimeHelper {

    system: Daemon;

    constructor(system: Daemon){
        this.logger = system.logger.Logger.getLogger('RuntimeHelper');
        this.system = system;
        this.profileManager = new ProfileManager(system);
        this.profile = this.profileManager;
    }

    initialize(cb) {
        return cb();
    }

    hasActiveProfile() {
        return this.profileManager.hasActiveProfile();
    }

    /**
     * Stop a task.
     * Stop the task of being executed. It could also be seen as a "pause" task.
     *
     * Stopping a task will result in destroy all reference of this task and emit 'stopped' event.
     * There will not have any more execution of this task. To start the task again we have to register it
     * from zero.
     *
     * @param taskId
     * @returns {Promise}
     */
    // unregisterTask(taskId){
    //     var self = this;
    //     return new Promise(function(resolve, reject){
    //
    //         // retrieve correct task
    //         var task = self.system.tasks.get(taskId);
    //
    //         if(!task){
    //             var error = new Error('This task does not seems to be active');
    //             error.code = 'notFound';
    //             return reject(error);
    //         }
    //
    //         try{
    //             // stop the task
    //             task.stop();
    //         }
    //         catch(err){
    //             return reject(err);
    //         }
    //         // remove all object listeners
    //         task.removeAllListeners('stopped')
    //             .removeAllListeners('execute');
    //
    //         // unreferencing the object, no need to keep in memory.
    //         self.system.tasks.delete(taskId);
    //
    //         // always return resolve if no errors.
    //         return resolve();
    //     });
    // }

    /**
     * Register the new task.
     *
     * + create a task container and add it to system
     * + start the task
     * - reject if plugin / module does not exist
     *
     * @param {Object} taskData json from api
     * @param {function} cb
     */
    // registerTask(taskData, cb){
    //
    //     var self = this;
    //
    //     var err = null;
    //
    //     if(_.find(this.system.tasks, function(entry){
    //             return entry.id === taskData.id;
    //         }) !== undefined){
    //         err = new Error('Task already running');
    //         err.code = "alreadyRunning";
    //     }
    //
    //     // Check if plugin exist
    //     if(!err && !this.system.plugins.has(taskData.pluginId)) {
    //         err = new Error(util.format('Unable to register task %s because its plugin id:%s does not seems loaded', taskData.name, taskData.pluginId));
    //         err.code = "pluginNotLoaded";
    //     }
    //
    //     // Check module exist
    //     if(!err && !this.system.modules.has(taskData.moduleId)){
    //         err = new Error(util.format('Unable to register %s [%s] because its module id:%s from plugin id:%s does not seems loaded', taskData.name, taskData.id, taskData.moduleId, taskData.pluginId));
    //         err.code = "moduleNotLoaded";
    //     }
    //
    //     if(err) {
    //         return cb(err);
    //     }
    //
    //     // Now we create the runtime task
    //     var task = new tasks.Task(this.system, taskData.id, taskData.userId, taskData.pluginId, taskData.moduleId, taskData.name, taskData.options, taskData.triggers);
    //
    //     // Keep task in collection
    //     // The task is not active yet, just stored.
    //     this.system.tasks.set(task.id, task);
    //
    //     this.logger.verbose('New task %s with id %s registered for module %s', task.name, task.id, task.moduleId);
    //
    //     // self.system.emit('task:registered:' + task.getModuleId(), task);
    //
    //     //task.on('stopped', function(){
    //     //    self.system.emit('task:stopped:' + task.getModuleId(), task);
    //     //});
    //
    //     //task.on('execute', function(trigger){
    //     //    self.system.emit('task:execute:' + task.getModuleId(), trigger);
    //     //});
    //
    //     task.initialize(function(err){
    //         if(err){
    //             self.logger.error('A problem when initializing a task', err.stack);
    //
    //             // remove the runtime task
    //             // ignore possible error when stopping
    //             return self.unregisterTask(task.id)
    //                 .then(function() {
    //                     return cb(err);
    //                 })
    //                 .catch(cb);
    //         }
    //         else {
    //             // get the relative module and add the new task
    //             var taskModule = self.system.modules.get(task.moduleId);
    //
    //             // this is the method used in plugin module
    //             // it allow user to listen to task event
    //             taskModule.registerNewTask(task);
    //
    //             // start the task
    //             task.start();
    //
    //             return cb();
    //         }
    //     });
    // }

    /**
     *
     * @param task
     */
    executeTask(task){
        var self = this;
        // create the runtime task
        var myTask = new Task(this.system, task.id, task.userId, task.pluginId, task.moduleId, task.options);
        var execution = new TaskExecution(undefined, myTask);

        // attach it to system
        this.system.executingTasks.set(execution.id, execution);

        // listen for execution stop
        execution.once("stop", function() {
            // remove from system
            // no more reference, the object should be deleted
            self.system.executingTasks.delete(execution.id);

            // emit event
            self.system.emit("runtime:task-execution:delete", execution.id);
        });

        // pass it to the module instance
        var moduleContainer = this.system.modules.get(myTask.moduleId);
        moduleContainer.instance.newTask(myTask);

        // emit event
        this.system.emit("runtime:task-execution:new", execution);
    }

    stopTask(taskExecution: TaskExecution) {
        // stop the execution
        taskExecution.stop();
    }
}

module.exports = RuntimeHelper;
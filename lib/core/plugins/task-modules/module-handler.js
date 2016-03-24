'use strict';

var async   = require('async');
var logger  = LOGGER.getLogger('ModuleHandler');
var Task    = require(CORE_DIR + '/plugins/tasks/task');

class ModuleHandler{

    constructor(system){
        this.system = system;
    }

    initializeModules(modules, done){

        async.forEachOf(modules, function(module, id, cb){
            logger.debug('Initialize module [%s]', module.id);
            var initialized = false;

            module.instance.initialize(function(err){
                initialized = true;
                return cb(err);
            });

            setTimeout(function(){
                if(!initialized){
                    logger.warn('The module [%s] seems to take abnormal long time to start!', module.id);
                }
            }, 1500);
        }, function(err){
            return done(err);
        });
    };

    /**
     * Register the new task.
     *
     * We only register task if the module exist.
     *
     * @param {Task} task
     * @param {function} cb
     */
    registerTask(task, cb){

        // Only register the task if the module exist
        if(!this.system.pluginsHandler.hasTaskModule(task.getModuleId())){
            logger.warn('Unable to register %s [%s] because its module [%s] does not exist', task.constructor.name, task.getId(), task.getModuleId());
            return cb();
        }

        // Keep task in collection
        // The task is not active yet, just stored.
        this.system.tasks.push(task);
        logger.verbose('New %s [%s] registered for module [%s]', task.constructor.name, task.getId(), task.getModuleId());

        // Only initialize the task if the module is active.
        if(!this.system.pluginsHandler.hasActiveModule(task.getModuleId())){
            logger.warn('The task %s is registered but not initialized as the module [%s] is installed but not active', task.getId(), task.getModuleId());
            return cb();
        }

        task.initialize();

        return cb();
    }
}

module.exports = ModuleHandler;
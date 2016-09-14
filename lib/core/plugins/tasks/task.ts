import _ from "lodash";
var TaskTriggers = require('./task-triggers');
import { EventEmitter }  from "events";

class ExecutionContext extends EventEmitter {
    constructor(task, options) {
        super();
        var self = this;
        this.task = task;
        this.options = options;

        this.task.on("stopped", function() {
            self.emit("stop");
        });
    }
}

/**
 * Module task
 *
 * A task is being executed when
 * - one of its trigger is executed
 */
class Task extends EventEmitter {

    logger: any;
    system: any;
    id: string;
    userId: any;
    options: any;
    name: string;

    constructor(system, id, userId, pluginId, moduleId, name, options, triggers){
        super();

        var self = this;
        this.logger = system.logger.Logger.getLogger('Task');

        options = options || {};

        this.system = system;
        this.id = id;
        this.userId = userId;

        // General options for the task. same for any execution
        // these options may be different for several tasks. These are not global task options.
        this.options = options;
        this.name = name;
        this.moduleId = moduleId;
        this.moduleName = system.modules.get(moduleId).name;
        this.pluginId = pluginId;
        this.triggers = new Map();
        this.stopped = true;

        //this.userOptions = {};
        // var map = new Map();

        // _.forEach(triggers, function(trigger){
        //     var instance = TaskTriggers.Build(system, self, trigger);
        //     self.triggers.set(trigger.id, instance);
        // });
    }

    /**
     * Initialize all triggers and listen for execute events
     * @param cb
     * @returns {*}
     */
    initialize(cb){
        var self = this;
        // _.forEach(this.triggers.values(), function(trigger){
        //     trigger.initialize(function(err){
        //         if(err){
        //             self.logger.error('A trigger is not able to initialize', err.stack);
        //
        //             return;
        //         }
        //
        //         trigger.on('execute', function(){
        //             self.execute(trigger);
        //         });
        //     });
        // });

        return cb();
    }

    /**
     * Execute the task with the given task trigger as context.
     */
    execute(trigger){
        this.logger.verbose('task [%s] executed for module [%s] with general options [%s] and context trigger [%s] with options [%s]', this.id, this.moduleId, JSON.stringify(this.options), trigger.type, JSON.stringify(trigger.options));

        var context = new ExecutionContext(this, this.options);
        this.emit('execute', context);
    }

    /**
     * Completely stop an active task.
     * - stop all triggers
     */
    stop(){
        if(this.stopped) {
            return;
        }

        this.stopped = true;
        // Stop each triggers
        // _.forEach(this.triggers.values(), function(trigger){
        //     trigger.stop();
        // });

        this.logger.verbose('Task [%s] stopped', this.id);
        this.emit('stopped');
    }

    /**
     * Start a task
     * - resume all triggers
     */
    start() {
        if(!this.stopped) {
            return;
        }

        this.stopped = false;
        // restart all triggers
        // _.forEach(this.triggers.values(), function(trigger){
        //     trigger.start();
        // });
        this.emit('started');
    }
}

module.exports = Task;

import _ from "lodash";
import * as uuid from "node-uuid";
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
export class Task extends EventEmitter {

    logger: any;
    system: any;
    id: number;
    executionId: string;
    userId: number;
    pluginId: number;
    moduleId: string;
    options: any;
    name: string;

    constructor(system, id, executionId = uuid.v4(), userId, pluginId, moduleId, options){
        super();

        this.logger = system.logger.Logger.getLogger('Task');
        this.system = system;
        this.id = id;
        this.executionId = executionId;
        this.userId = userId;
        this.options = options;
        this.moduleId = moduleId;
        this.pluginId = pluginId;
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

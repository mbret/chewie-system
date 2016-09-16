"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var uuid = require("node-uuid");
var TaskTriggers = require('./task-triggers');
var events_1 = require("events");
var ExecutionContext = (function (_super) {
    __extends(ExecutionContext, _super);
    function ExecutionContext(task, options) {
        _super.call(this);
        var self = this;
        this.task = task;
        this.options = options;
        this.task.on("stopped", function () {
            self.emit("stop");
        });
    }
    return ExecutionContext;
}(events_1.EventEmitter));
/**
 * Module task
 *
 * A task is being executed when
 * - one of its trigger is executed
 */
var Task = (function (_super) {
    __extends(Task, _super);
    function Task(system, id, executionId, userId, pluginId, moduleId, options) {
        if (executionId === void 0) { executionId = uuid.v4(); }
        _super.call(this);
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
    Task.prototype.initialize = function (cb) {
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
    };
    /**
     * Execute the task with the given task trigger as context.
     */
    Task.prototype.execute = function (trigger) {
        this.logger.verbose('task [%s] executed for module [%s] with general options [%s] and context trigger [%s] with options [%s]', this.id, this.moduleId, JSON.stringify(this.options), trigger.type, JSON.stringify(trigger.options));
        var context = new ExecutionContext(this, this.options);
        this.emit('execute', context);
    };
    /**
     * Completely stop an active task.
     * - stop all triggers
     */
    Task.prototype.stop = function () {
        if (this.stopped) {
            return;
        }
        this.stopped = true;
        // Stop each triggers
        // _.forEach(this.triggers.values(), function(trigger){
        //     trigger.stop();
        // });
        this.logger.verbose('Task [%s] stopped', this.id);
        this.emit('stopped');
    };
    /**
     * Start a task
     * - resume all triggers
     */
    Task.prototype.start = function () {
        if (!this.stopped) {
            return;
        }
        this.stopped = false;
        // restart all triggers
        // _.forEach(this.triggers.values(), function(trigger){
        //     trigger.start();
        // });
        this.emit('started');
    };
    return Task;
}(events_1.EventEmitter));
exports.Task = Task;

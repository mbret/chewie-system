var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TaskTriggers = require('./task-triggers');
var events_1 = require("events");
// class ExecutionContext extends EventEmitter {
//     constructor(task, options) {
//         super();
//         var self = this;
//         this.task = task;
//         this.options = options;
//
//         this.task.on("stopped", function() {
//             self.emit("stop");
//         });
//     }
// }
/**
 * Module task
 *
 * A task is being executed when
 * - one of its trigger is executed
 */
var Task = (function (_super) {
    __extends(Task, _super);
    function Task(system, id, userId, pluginId, moduleId, options) {
        _super.call(this);
        this.logger = system.logger.Logger.getLogger('Task');
        this.system = system;
        this.id = id;
        this.userId = userId;
        this.options = options;
        this.moduleId = moduleId;
        this.pluginId = pluginId;
        this.stopped = false;
    }
    /**
     * Initialize all triggers and listen for execute events
     * @param cb
     * @returns {*}
     */
    // initialize(cb){
    //     var self = this;
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
    //
    //     return cb();
    // }
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
    // stop(){
    //     if(this.stopped) {
    //         return;
    //     }
    //
    //     this.stopped = true;
    //     // Stop each triggers
    //     // _.forEach(this.triggers.values(), function(trigger){
    //     //     trigger.stop();
    //     // });
    //
    //     this.logger.verbose('Task [%s] stopped', this.id);
    //     this.emit('stopped');
    // }
    Task.prototype.stop = function () {
        if (!this.stopped) {
            this.stopped = true;
            this.emit("stop");
        }
    };
    return Task;
})(events_1.EventEmitter);
exports.Task = Task;

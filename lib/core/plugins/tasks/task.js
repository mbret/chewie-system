"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TaskTriggers = require('./task-triggers');
var events_1 = require("events");
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
    Task.prototype.execute = function (trigger) {
        this.logger.verbose('task [%s] executed for module [%s] with general options [%s] and context trigger [%s] with options [%s]', this.id, this.moduleId, JSON.stringify(this.options), trigger.type, JSON.stringify(trigger.options));
        var context = new ExecutionContext(this, this.options);
        this.emit('execute', context);
    };
    Task.prototype.stop = function () {
        if (!this.stopped) {
            this.stopped = true;
            this.emit("stop");
        }
    };
    return Task;
}(events_1.EventEmitter));
exports.Task = Task;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var uuid = require("node-uuid");
var events_1 = require("events");
/**
 *
 */
var TaskExecution = (function (_super) {
    __extends(TaskExecution, _super);
    function TaskExecution(id, task, type) {
        if (id === void 0) { id = uuid.v4(); }
        if (type === void 0) { type = 1 /* DIRECT */; }
        var _this = _super.call(this) || this;
        var self = _this;
        _this.id = id;
        _this.task = task;
        _this.type = type;
        _this.task.once("stop", function () {
            self.stop();
        });
        return _this;
    }
    TaskExecution.prototype.stop = function () {
        this.task.stop();
        // remove potential listeners
        this.task.removeAllListeners('stop');
        this.emit("stop");
    };
    return TaskExecution;
}(events_1.EventEmitter));
exports.TaskExecution = TaskExecution;

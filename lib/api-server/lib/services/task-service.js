"use strict";
var TaskService = (function () {
    function TaskService() {
    }
    TaskService.prototype.toJson = function (task) {
        var self = this;
        var json = null;
        if (Array.isArray(task)) {
            json = [];
            task.forEach(function (task) {
                json.push(self.toJson(task));
            });
            return json;
        }
        else {
            json = {
                id: task.id,
                executionId: task.executionId
            };
        }
        return json;
    };
    return TaskService;
}());
exports.TaskService = TaskService;

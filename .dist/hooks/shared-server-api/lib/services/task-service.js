"use strict";
class TaskService {
    toJson(task) {
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
            };
        }
        return json;
    }
    taskExecutionToJson(execution) {
        var self = this;
        var json = null;
        if (Array.isArray(execution)) {
            json = [];
            execution.forEach(function (task) {
                json.push(self.taskExecutionToJson(task));
            });
            return json;
        }
        else {
            json = {
                id: execution.id,
                type: execution.type,
                task: self.toJson(execution.task)
            };
        }
        return json;
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task-service.js.map
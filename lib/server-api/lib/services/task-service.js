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
                id: task.id
            };
        }
        return json;
    };
    TaskService.prototype.taskExecutionToJson = function (execution) {
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
    };
    return TaskService;
})();
exports.TaskService = TaskService;

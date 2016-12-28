import {Task} from "../../../core/plugins/tasks/task";
import {TaskExecution} from "../../../core/plugins/tasks/task-execution";

export class TaskService {

    toJson(task: Task | Task[]) {
        var self = this;
        var json = null;

        if (Array.isArray(task)) {
            json = [];
            task.forEach(function(task: Task) {
                json.push(self.toJson(task));
            });
            return json;
        } else {
            json = {
                id: task.id,
            };
        }

        return json;
    }

    taskExecutionToJson(execution: TaskExecution | TaskExecution[]) {
        var self = this;
        var json = null;

        if (Array.isArray(execution)) {
            json = [];
            execution.forEach(function(task: TaskExecution) {
                json.push(self.taskExecutionToJson(task));
            });
            return json;
        } else {
            json = {
                id: execution.id,
                type: execution.type,
                task: self.toJson(execution.task)
            };
        }

        return json;
    }
}
import {Task} from "../../../core/plugins/tasks/task";

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
                executionId: task.executionId,
            };
        }

        return json;
    }
}
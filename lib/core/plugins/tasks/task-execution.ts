import * as uuid from "node-uuid";
import {Task} from "./task";
import {EventEmitter} from "events";

export const enum TaskExecutionType {
    DIRECT = 1,
}

/**
 *
 */
export class TaskExecution extends EventEmitter {

    id: string;
    task: Task;
    type: TaskExecutionType;

    constructor(id: string = uuid.v4(), task: Task, type: number = TaskExecutionType.DIRECT) {
        super();
        var self = this;
        this.id = id;
        this.task = task;
        this.type = type;

        this.task.once("stop", function() {
            self.stop();
        });
    }

    stop() {
        this.task.stop();

        // remove potential listeners
        this.task.removeAllListeners('stop');

        this.emit("stop");
    }
}
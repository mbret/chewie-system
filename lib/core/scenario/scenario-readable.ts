import { EventEmitter }  from "events";
import {ScenarioModel} from "../../hooks/shared-server-api/lib/models/scenario";
import * as uuid from "node-uuid";

/**
 * Root scenario. Has an execution id
 */
export default class ScenarioReadable extends EventEmitter {
    executionId: string;
    model: ScenarioModel;
    runningTasks: Array<any>;

    constructor(model: ScenarioModel) {
        super();
        this.executionId = uuid.v4();
        this.model = model;
        this.runningTasks = [];
    }

    public hasRunningTasks() {
        return this.runningTasks.length > 0;
    }
}
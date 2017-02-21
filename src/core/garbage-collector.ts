import {System} from "../system";
import {debug} from "../shared/debug";

export class GarbageCollector {

    static INTERVAL = 120000; // 2mn
    protected tasks: Array<Function>;

    constructor(system: System) {
        let self = this;
        this.tasks = [];
        setInterval(function() {
            debug("garbage-collector")("Process tasks");
            self.tasks.forEach(function(task) {
                task();
            });
        }, GarbageCollector.INTERVAL);
    }

    public registerTask(fn: Function) {

    }
}
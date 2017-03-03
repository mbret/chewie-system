import {PluginInstance} from "./plugin-instance-interface";
import {System} from "../../system";
import {PluginHelper} from "./plugin-helper";

export class PluginInstanceDefault implements PluginInstance {

    constructor(chewie: System, helper: PluginHelper) {

    }

    mount(cb: Function) {
        return cb();
    }

    unmount(cb: Function) {
        return cb();
    }

}
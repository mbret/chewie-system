import {PluginInstance} from "./plugin-instance-interface";

/**
 * This class is used when the plugin package does not provide plugin object.
 */
export class DefaultPluginInstance implements PluginInstance {
    constructor(helper) {

    }
    mount(cb) {
        return cb();
    }
    unMount(cb) {
        return cb();
    }
}
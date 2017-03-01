import {PluginInstance} from "../plugin-instance-interface";

export interface ModuleInstanceInterface extends Object {
    constructor(pluginInstance: PluginInstance, moduleInfo: any);
    // task
    run(options: any, done: Function);
    // trigger
    onNewDemand(options: any, trigger: Function, done: Function);
    stop();
}

// export interface TriggerModuleInstanceInterface extends ModuleInstanceInterface {
//     onNewDemand();
// }
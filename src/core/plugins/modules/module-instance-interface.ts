import {PluginInstance} from "../plugin-instance-interface";

export interface ModuleInstanceInterface {

    constructor(pluginInstance: PluginInstance, moduleInfo: any);

    stop(done: Function);
}

export interface TaskModuleInstanceInterface extends ModuleInstanceInterface {

    /**
     * @param options
     * @param done
     */
    newDemand(options: any, done: Function);
}

export interface TriggerModuleInstanceInterface extends ModuleInstanceInterface {

    /**
     * @param options
     * @param trigger
     * @param done
     */
    newDemand(options: any, trigger: Function, done: Function);
}
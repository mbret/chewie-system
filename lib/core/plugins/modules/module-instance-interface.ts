export interface ModuleInstanceInterface {
    // task
    run(options: any, done: Function);
    // trigger
    onNewDemand(options: any, trigger: Function, done: Function);
    stop();
}

// export interface TriggerModuleInstanceInterface extends ModuleInstanceInterface {
//     onNewDemand();
// }
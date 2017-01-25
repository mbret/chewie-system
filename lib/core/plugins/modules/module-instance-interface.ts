export interface ModuleInstanceInterface {
    // task
    run(options: any, done: Function);
    // trigger
    onNewDemand(options: any, trigger: Function, done: Function);
}

// export interface TriggerModuleInstanceInterface extends ModuleInstanceInterface {
//     onNewDemand();
// }
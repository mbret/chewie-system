"use strict";

import {System} from "../../../system";
import {PluginContainer} from "../plugin-container";
import {ModuleInstanceInterface} from "./module-instance-interface";

export class ModuleContainer {

    system: System;
    pluginContainer: PluginContainer;
    // module: any;
    moduleInfo: any;
    instance: ModuleInstanceInterface;
    uniqueId: string;
    id: string;
    logger: any;
    stopped: boolean;

    constructor(system, pluginContainer, moduleInfo, instance){
        this.system = system;
        this.logger = this.system.logger.getLogger('ModuleContainer');
        this.uniqueId = ModuleContainer.getModuleUniqueId(pluginContainer.plugin.name, moduleInfo.id);
        this.id = this.uniqueId;
        this.instance = instance;
        this.pluginContainer = pluginContainer;
        this.moduleInfo = moduleInfo;
        // this.module = moduleInfo;
        this.stopped = false;
    }

    static getModuleUniqueId(pluginId: string, moduleId: string) {
        return pluginId + ":" + moduleId;
    }

    public stopInstance(): Promise<any> {
        let self = this;
        this.stopped = true;
        return new Promise(function(resolve) {
            return self.instance.stop(function(err) {
                return resolve();
            });
        });
    }
}
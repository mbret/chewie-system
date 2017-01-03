"use strict";

import {System} from "../../../system";
import {PluginContainer} from "../plugin-container";
// import * as uuid from "node-uuid";

export class ModuleContainer {

    system: System;
    pluginContainer: PluginContainer;
    module: any;
    instance: any;
    uniqueId: string;
    id: string;
    logger: any;

    constructor(system, pluginContainer, moduleInfo, instance){
        this.system = system;
        this.logger = this.system.logger.getLogger('ModuleContainer');
        this.uniqueId = ModuleContainer.getModuleUniqueId(pluginContainer.plugin.name, moduleInfo.id);
        // runtime id
        // this.id = uuid.v4();
        this.id = this.uniqueId;
        this.instance = instance;
        this.pluginContainer = pluginContainer;
        this.module = moduleInfo;
    }

    static getModuleUniqueId(pluginId: string, moduleId: string) {
        return pluginId + ":" + moduleId;
    }
}
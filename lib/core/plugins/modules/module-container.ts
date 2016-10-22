"use strict";

import {Daemon} from "../../../daemon";
import {PluginContainer} from "../plugin-container";
import * as uuid from "node-uuid";

export class ModuleContainer {

    system: Daemon;
    pluginContainer: PluginContainer;
    module: any;
    instance: any;
    uniqueId: string;
    logger: any;

    constructor(system, pluginContainer, moduleInfo, instance){
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleContainer');
        this.uniqueId = this.getModuleUniqueId(pluginContainer.plugin.name, moduleInfo.id);
        // runtime id
        this.id = uuid.v4();
        this.instance = instance;
        this.pluginContainer = pluginContainer;
        this.module = moduleInfo;
    }

    getModuleUniqueId(pluginId: string, moduleId: string) {
        return pluginId + ":" + moduleId;
    }
}
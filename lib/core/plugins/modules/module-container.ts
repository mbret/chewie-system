"use strict";

import {Daemon} from "../../../daemon";

export class ModuleContainer {

    system: Daemon;

    constructor(system, plugin, moduleInfo, instance){
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleContainer');
        this.uniqueId = this.getModuleUniqueId(plugin.id, moduleInfo.id);
        this.instance = instance;
    }

    getModuleUniqueId(pluginId: string, moduleId: string) {
        return pluginId + ":" + moduleId;
    }
}
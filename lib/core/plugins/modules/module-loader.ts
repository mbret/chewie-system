"use strict";

import {Daemon} from "../../daemon";

export class ModuleLoader {

    system: Daemon;
    logger: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleLoader');
    }

    loadModule(plugin, moduleId) {

    }
}
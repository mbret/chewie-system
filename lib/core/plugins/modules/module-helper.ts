"use strict";

import {Daemon} from "../../../daemon";
import {ModuleContainer} from "./module-container";
var self = this;

export class ModuleHelper {

    system: Daemon;
    logger: any;
    moduleContainer: ModuleContainer;

    constructor(system, moduleContainer) {
        self = this;
        this.system = system;
        this.moduleContainer = moduleContainer;
        this.logger = this.system.logger.Logger.getLogger('ModuleHelper');
    }

    /**
     * Return only task modules for the current plugin.
     * @returns {Array}
     */
    getActiveTasksFromMyPlugin() {
        var modules = [];
        this.system.modules.forEach(function(container) {
            if (container.plugin.id === self.moduleContainer.plugin.id && container.module.type === "task") {
                modules.push(container.instance);
            }
        });

        return modules;
    }
}
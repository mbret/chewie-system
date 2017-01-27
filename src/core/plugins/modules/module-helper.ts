"use strict";

import {System} from "../../../system";
import {ModuleContainer} from "./module-container";
let self = this;

export class ModuleHelper {

    system: System;
    logger: any;
    moduleContainer: ModuleContainer;
    shared: any;

    constructor(system, moduleContainer) {
        self = this;
        this.system = system;
        this.moduleContainer = moduleContainer;
        this.logger = this.system.logger.getLogger('ModuleHelper:' + this.moduleContainer.uniqueId);
        this.shared = this.moduleContainer.pluginContainer.shared;
        this.id = moduleContainer.id;
    }

    /**
     * Return only task modules for the current plugin.
     * @returns {Array}
     */
    //getActiveTasksFromMyPlugin() {
    //    var modules = [];
    //    this.system.runtime.modules.forEach(function(container) {
    //        if (container.pluginContainer.id === self.moduleContainer.pluginContainer.id && container.module.type === "task") {
    //            modules.push(container.instance);
    //        }
    //    });
    //
    //    return modules;
    //}
}
'use strict';

let _ = require('lodash');
import {System} from "../system";
import {PluginContainer} from "./plugins/plugin-container";
import {ProfileManager} from "./profile-manager";
import {ModuleContainer} from "./plugins/modules/module-container";
import {SystemModuleInterface} from "./system-module-interface";
let util = require("util");

export class Runtime implements SystemModuleInterface {
    system: System;
    plugins: Map<string, PluginContainer>;
    modules: Map<string, ModuleContainer>;
    // executingTasks: Map<string, TaskExecution>;
    profileManager: ProfileManager;
    logger: any;

    constructor(system: System){
        this.logger = system.logger.getLogger('Runtime');
        this.system = system;
        this.profileManager = new ProfileManager(system);
        this.plugins = new Map();
        this.modules = new Map();
        // Contain tasks by their id
        this.executingTasks = new Map();
    }

    hasActiveProfile() {
        return this.profileManager.hasActiveProfile();
    }
}
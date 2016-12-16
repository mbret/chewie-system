'use strict';

let _ = require('lodash');
let tasks = require("./plugins/tasks");
import {Daemon} from "../daemon";
import {PluginContainer} from "./plugins/plugin-container";
import {ProfileManager} from "./profile-manager";
import {ModuleContainer} from "./plugins/modules/module-container";
import {SystemModuleInterface} from "./system-module-interface";
let util = require("util");

export class Runtime implements SystemModuleInterface {
    system: Daemon;
    scenarios: Map<string, any>;
    plugins: Map<string, PluginContainer>;
    modules: Map<string, ModuleContainer>;
    profileManager: ProfileManager;
    logger: any;

    constructor(system: Daemon){
        this.logger = system.logger.Logger.getLogger('Runtime');
        this.system = system;
        this.profileManager = new ProfileManager(system);
        this.scenarios = new Map();
        this.plugins = new Map();
        this.modules = new Map();
    }

    hasActiveProfile() {
        return this.profileManager.hasActiveProfile();
    }
}
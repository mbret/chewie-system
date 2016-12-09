'use strict';

let _ = require('lodash');
let tasks = require("./plugins/tasks");
import {Daemon} from "../daemon";
import {PluginContainer} from "./plugins/plugin-container";
import {ProfileManager} from "./profile-manager";
import {ModuleContainer} from "./plugins/modules/module-container";
let util = require("util");

export class Runtime {

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

    initialize(cb) {
        return cb();
    }

    hasActiveProfile() {
        return this.profileManager.hasActiveProfile();
    }
}
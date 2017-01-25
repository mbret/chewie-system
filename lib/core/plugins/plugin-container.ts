'use strict';

import {System} from "../../system";
import {PluginInstance} from "./plugins-loader";

export class PluginContainer {

    system: System;
    plugin: any;
    instance: PluginInstance;
    logger: any;
    shared: any;

    constructor(system, plugin, instance: PluginInstance){
        this.system = system;
        this.logger = this.system.logger.getLogger('PluginContainer');
        this.instance = instance;
        this.plugin = plugin;
        this.shared = {};
    }
}
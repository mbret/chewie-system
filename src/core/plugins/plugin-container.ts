'use strict';

import {System} from "../../system";
import {PluginInstance} from "./plugin-instance-interface";
import {Plugin} from "../../hooks/shared-server-api/lib/models/plugins";

export class PluginContainer {

    system: System;
    plugin: Plugin;
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
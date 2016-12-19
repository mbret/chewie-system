'use strict';

import {System} from "../../system";

export class PluginContainer {

    system: System;
    plugin: any;
    //instance: any;
    logger: any;
    shared: any;

    constructor(system, plugin, instance){
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginContainer');
        //this.instance = instance;
        this.plugin = plugin;
        this.shared = {};
    }
}
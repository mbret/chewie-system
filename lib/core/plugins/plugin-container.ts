'use strict';

import {Daemon} from "../../daemon";

export class PluginContainer {

    system: Daemon;
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
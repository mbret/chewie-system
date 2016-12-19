'use strict';

import {System} from "../../system";
import {PluginContainer} from "./plugin-container";

export class PluginHelper {

    system: System;
    pluginContainer: PluginContainer;
    logger: any;
    shared: any;

    constructor(system, pluginContainer){
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('PluginHelper');
        this.pluginContainer = pluginContainer;
        this.shared = this.pluginContainer.shared;
    }
}
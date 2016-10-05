'use strict';
import {Daemon} from "../../../daemon";

var _ = require('lodash');
var util = require('util');

export class ModuleHelper {

    system: Daemon;
    logger: any;
    moduleInfo: any;

    constructor(system, moduleInfo) {
        this.system = system;
        this.moduleInfo = moduleInfo;
        this.logger = this.system.logger.Logger.getLogger('ModuleHelper');
    }

    getTasksFromMyPlugin() {
        var modules = this.system.modules.get(this.moduleInfo.plugin.id + ":" + this.moduleInfo.id);
    }
}

module.exports = ModuleHelper;
"use strict";

import * as _ from "lodash";
import * as path from "path"
import {ModuleHelper} from "./module-helper";
import {ModuleContainer} from "./module-container";
import {System} from "../../../system";

export class ModuleLoader {

    system: System;
    logger: any;
    synchronizedPluginsPath: string;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ModuleLoader');
        this.synchronizedPluginsPath = path.join(this.system.config.system.dataDir, this.system.config.system.synchronizedPluginsDir);
    }

    loadModule(plugin: any, moduleId) {
        // get module info
        let moduleInfo = _.find(plugin.package.modules, function(module: any) {
            return module.id === moduleId;
        });

        // get module instance path
        let modulePath = moduleInfo.module;
        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
        // ./module will become D://foo/bar/plugins/module
        if (!path.isAbsolute(modulePath)) {
            let pluginAbsolutePath = path.resolve(this.synchronizedPluginsPath, plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }

        // create container
        let container = new ModuleContainer(this.system, this.system.runtime.plugins.get(plugin.name), moduleInfo, null);

        // now require the module & fill empty required methods
        let Module = require(modulePath);
        Module.prototype.stop = Module.prototype.stop || function() {};

        let helper = new ModuleHelper(this.system, container);
        container.instance = new Module(helper, moduleInfo);

        return Promise.resolve(container);
    }
}
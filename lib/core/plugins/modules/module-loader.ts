"use strict";

import * as _ from "lodash";
import * as path from "path"
import {ModuleHelper} from "./module-helper";
import {ModuleContainer} from "./module-container";
import {Daemon} from "../../../daemon";

export class ModuleLoader {

    system: Daemon;
    logger: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleLoader');
    }

    loadModule(plugin: any, moduleId) {
        // get module info
        var moduleInfo = _.find(plugin.modules, function(module: any) {
            return module.id === moduleId;
        });

        // get module instance path
        var modulePath = moduleInfo.module;
        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
        // ./module will become D://foo/bar/plugins/module
        if (!path.isAbsolute(modulePath)) {
            var pluginAbsolutePath = path.resolve(this.system.config.system.synchronizedPluginsDir, plugin.id);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }

        // create container
        var container = new ModuleContainer(this.system, this.system.runtime.plugins.get(plugin.id), moduleInfo, null);

        // now require the module
        var Module = require(modulePath);
        var helper = new ModuleHelper(this.system, container);
        container.instance = new Module(helper, moduleInfo);

        return Promise.resolve(container);
    }
}
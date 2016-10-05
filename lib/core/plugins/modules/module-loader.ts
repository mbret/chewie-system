"use strict";

import {Daemon} from "../../daemon";
import * as _ from "lodash";
import * as path from "path"
import {ModuleHelper} from "./module-helper";

export class ModuleLoader {

    system: Daemon;
    logger: any;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.Logger.getLogger('ModuleLoader');
    }

    loadModule(plugin, moduleId) {
        // get module info
        var moduleInfo = _.find(plugin.modules, function(module) {
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

        // now require the module
        var Module = require(modulePath);
        var instance = new Module(new ModuleHelper(this.system, {moduleInfo}), moduleInfo);

        this.system.modules.add(plugin.id + ":" + moduleInfo.id, {
            instance: instance
        });

        return Promise.resolve(instance);
    }
}
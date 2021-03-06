"use strict";

import * as _ from "lodash";
import * as path from "path"
// import {ModuleHelper} from "./module-helper";
import {ModuleContainer} from "./module-container";
import {System} from "../../../system";
import {PluginsLoader} from "../plugins-loader";
import {PluginContainer} from "../plugin-container";
import {ModuleInstanceInterface} from "./module-instance-interface";

export class ModuleLoader {

    system: System;
    logger: any;
    synchronizedPluginsPath: string;
    pluginsLoader: PluginsLoader;

    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ModuleLoader');
        this.synchronizedPluginsPath = this.system.config.synchronizedPluginsPath;
        this.pluginsLoader = new PluginsLoader(system);
    }

    /**
     * @param plugin
     * @param moduleId
     * @returns {Promise<ModuleContainer>}
     */
    loadModule(plugin: PluginContainer, moduleId): Promise<ModuleContainer> {
        // get module info
        let moduleInfo = _.find(plugin.plugin.package.chewie.modules, function(module: any) {
            return module.id === moduleId;
        });

        // get module instance path
        let modulePath = moduleInfo.module;

        // if path is relative we need to build absolute path because runtime is not inside the plugin dir
        // ./module will become D://foo/bar/plugins/module
        if (!path.isAbsolute(modulePath)) {
            let pluginAbsolutePath = path.resolve(this.synchronizedPluginsPath, plugin.plugin.name);
            modulePath = path.resolve(pluginAbsolutePath, modulePath);
        }

        // create container
        let container = new ModuleContainer(this.system, this.pluginsLoader.getPluginContainerByName(plugin.plugin.name), moduleInfo, null);

        // now require the module & fill empty required methods
        let Module = require(modulePath);
        if (!Module.prototype) {
            return Promise.reject("The module " + moduleId + " does not seems to be callable. Please verify the module declaration");
        }

        // attach default methods
        if (moduleInfo.type === "task") {
            // task
            Module.prototype.newDemand = Module.prototype.newDemand || ((options, done) => done());
        } else {
            // trigger
            Module.prototype.newDemand = Module.prototype.newDemand || ((options, trigger, done) => done());
        }
        Module.prototype.stop = Module.prototype.stop || ((done) => done());

        // let helper = new ModuleHelper(this.system, container);
        container.instance = new Module(plugin.instance, moduleInfo);

        return Promise.resolve(container);
    }
}
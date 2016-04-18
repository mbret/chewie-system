'use strict';

class PluginContainer{

    constructor(moduleName, packageJson, pluginPackage, pluginOptions){
        this.name = moduleName;
        this.id = moduleName;
        this.outputAdapters = [];
        this.modules = [];
        this.pluginOptions = pluginOptions || {};
        this.packageJson = packageJson;
        this.pluginPackage = pluginPackage;
    }

    getId(){
        return this.id;
    }

    getPluginOptions(){
        return this.pluginOptions;
    }
}

module.exports = PluginContainer;
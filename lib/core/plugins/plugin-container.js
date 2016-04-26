'use strict';

class PluginContainer{

    constructor(moduleName, packageJson, pluginPackage, options, config){
        this.name = moduleName;
        this.id = moduleName;
        this.outputAdapters = [];
        this.modules = [];
        this.options = options || {};
        this.packageJson = packageJson;
        this.pluginPackage = pluginPackage;
        this.tmpDir = config.tmpDir;
        this.dataDir = config.dataDir;
    }

    getId(){
        return this.id;
    }

    getOptions(){
        return this.options;
    }

    setOptions(options){
        this.options = options;
        return this;
    }
}

module.exports = PluginContainer;
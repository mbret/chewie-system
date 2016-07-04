'use strict';

class PluginContainer {

    constructor(id, moduleName, packageJson, pluginPackage, options, config){
        this.name = moduleName;
        this.id = id;
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
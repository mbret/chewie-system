'use strict';

class PluginContainer{

    constructor(moduleName, packageJson, pluginPackage, options){
        this.name = moduleName;
        this.id = moduleName;
        this.outputAdapters = [];
        this.modules = [];
        this.options = options || {};
        this.packageJson = packageJson;
        this.pluginPackage = pluginPackage;
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
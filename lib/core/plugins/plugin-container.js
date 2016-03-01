'use strict';

class PluginContainer{

    constructor(moduleName){
        this.name = moduleName;
        this.id = moduleName;
        this.messageAdapters = [];
        this.modules = [];
    }
}

module.exports = PluginContainer;
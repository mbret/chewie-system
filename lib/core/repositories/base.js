'use strict';

class Repository{
    constructor(system){
        this.system = system;
    }

    loadPlugin(name){
        throw new Error('Not implemented');
    }
}

module.exports = Repository;
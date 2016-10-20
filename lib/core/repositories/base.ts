'use strict';

class BaseRepository {

    constructor(system){
        this.system = system;
    }

    loadPlugin(name){
        throw new Error('Not implemented');
    }
}

export = BaseRepository;
'use strict';
import {Daemon} from "../../daemon";

class BaseRepository {

    system: Daemon;
    logger: any;

    constructor(system, logger){
        this.system = system;
        this.logger = logger;
    }

    loadPlugin(name){
        throw new Error('Not implemented');
    }
}

export = BaseRepository;
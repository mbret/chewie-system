'use strict';
import {System} from "../../system";

class BaseRepository {

    system: System;
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
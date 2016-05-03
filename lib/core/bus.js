'use strict';

const EventEmitter = require('events');

class Bus extends EventEmitter {

    constructor(system){
        super();
        
        this.system = system;
    }
}

module.exports = Bus;
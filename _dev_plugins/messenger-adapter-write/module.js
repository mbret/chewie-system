'use strict';

var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

class Module{

    constructor(helper){
        //this.daemon = daemon;
        this.config = [];
        this.logger = helper.getLogger();
    }

    getConfig(){
        return {
            displayName: 'Console'
        }
    }

    initialize(cb)
    {
        return cb();
    }

    execute(message){
        this.logger.info(message);
    }
}

module.exports = Module;
'use strict';

var _ = require('lodash');
var AbstractWrapper = require('./abstract-wrapper.js');

class ModuleWrapper extends AbstractWrapper{

    constructor(id, instance){
        super(buddy);
        this.id = id;
        this.instance = instance;
    }

    getConfig(){
        return this.instance.getConfig();
    }
}

module.exports = ModuleWrapper;
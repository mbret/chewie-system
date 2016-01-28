'use strict';

var _ = require('lodash');
var AbstractWrapper = require('./abstract-wrapper.js');

class ModuleWrapper extends AbstractWrapper{

    constructor(id, instance){
        super(MyBuddy);
        this.id = id;
        this.instance = instance;
    }

    /**
     * Return the plugin config.
     * @returns {object}
     */
    getConfig(){
        return this.instance.getConfig();
    }
}

module.exports = ModuleWrapper;
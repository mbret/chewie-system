'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../plugins/abstract-container.js');

class ModuleWrapper extends AbstractContainer{

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
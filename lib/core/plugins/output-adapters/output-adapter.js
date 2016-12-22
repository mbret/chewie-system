'use strict';
var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');
class OutputAdapter extends AbstractContainer {
    constructor(system, pluginId, id, instance, options) {
        super(system, pluginId, options, instance);
        this.id = id;
    }
    executeMessage(message) {
        this.instance.executeMessage(message);
    }
    static isInstanceValid(instance) {
        if (typeof instance !== 'function') {
            return false;
        }
        if (!(instance.prototype.initialize instanceof Function)) {
            return false;
        }
        return true;
    }
}
module.exports = OutputAdapter;

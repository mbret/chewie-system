'use strict';
var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');
var uuid = require('uuid');
class TriggerContainer extends AbstractContainer {
    constructor(pluginId, id, instance, userOptions) {
        super(MyBuddy, pluginId, userOptions, instance);
        this.logger = MyBuddy.logger.Logger.getLogger('taskTriggerContainer');
        this.id = id;
        this.instance = instance;
    }
    getConfig() {
        return _.merge({
            triggerOptions: []
        }, super.getConfig());
    }
    getId() {
        return this.id;
    }
    static checkModuleValidity(module, moduleName) {
        if (typeof module !== 'function') {
            this.logger.error('The module [' + moduleName + '] is not a function');
            return false;
        }
        if (!(module.prototype.initialize instanceof Function)
            || !(module.prototype.getConfig instanceof Function)) {
            this.logger.error('The module [' + moduleName + '] does not have minimal required methods!');
            return false;
        }
        return true;
    }
    watch(options, cb) {
        var id = uuid.v4();
        this.emit('trigger:watch', id, options);
        this.on('trigger:execute:' + id, function () {
            return cb();
        });
    }
}
module.exports = TriggerContainer;

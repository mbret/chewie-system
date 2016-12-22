'use strict';
var AbstractHelper = require('../plugins/abstract-helper.js');
var _ = require('lodash');
class TaskTriggerHelper extends AbstractHelper {
    constructor(daemon, module) {
        super(daemon, module);
        this.daemon = daemon;
        this.module = module;
        this.logger = MyBuddy.logger.Logger.getLogger('Module [' + this.module.id + ']');
    }
    onNewWatch(cb) {
        var self = this;
        this.module.on('trigger:watch', function (id, options) {
            return cb(options, function () {
                self.module.emit('trigger:execute:' + id);
            });
        });
    }
}
module.exports = TaskTriggerHelper;

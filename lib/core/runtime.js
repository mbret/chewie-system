'use strict';
var _ = require('lodash');
var tasks = require("./plugins/tasks");
var profile_manager_1 = require("./profile-manager");
var util = require("util");
var Runtime = (function () {
    function Runtime(system) {
        this.logger = system.logger.Logger.getLogger('Runtime');
        this.system = system;
        this.profileManager = new profile_manager_1.ProfileManager(system);
        this.scenarios = new Map();
        this.plugins = new Map();
        this.modules = new Map();
    }
    Runtime.prototype.initialize = function (cb) {
        return cb();
    };
    Runtime.prototype.hasActiveProfile = function () {
        return this.profileManager.hasActiveProfile();
    };
    return Runtime;
}());
exports.Runtime = Runtime;

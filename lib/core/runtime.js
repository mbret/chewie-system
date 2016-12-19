'use strict';
var _ = require('lodash');
var profile_manager_1 = require("./profile-manager");
// import {TaskExecution} from "./plugins/tasks/task-execution";
var util = require("util");
var Runtime = (function () {
    function Runtime(system) {
        this.logger = system.logger.Logger.getLogger('Runtime');
        this.system = system;
        this.profileManager = new profile_manager_1.ProfileManager(system);
        this.scenarios = new Map();
        this.plugins = new Map();
        this.modules = new Map();
        // Contain tasks by their id
        this.executingTasks = new Map();
    }
    Runtime.prototype.hasActiveProfile = function () {
        return this.profileManager.hasActiveProfile();
    };
    return Runtime;
}());
exports.Runtime = Runtime;

'use strict';
let _ = require('lodash');
const profile_manager_1 = require("./profile-manager");
let util = require("util");
class Runtime {
    constructor(system) {
        this.logger = system.logger.getLogger('Runtime');
        this.system = system;
        this.profileManager = new profile_manager_1.ProfileManager(system);
        this.plugins = new Map();
        this.modules = new Map();
        this.executingTasks = new Map();
    }
    hasActiveProfile() {
        return this.profileManager.hasActiveProfile();
    }
}
exports.Runtime = Runtime;
//# sourceMappingURL=runtime.js.map
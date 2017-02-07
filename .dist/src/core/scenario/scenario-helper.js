"use strict";
const _ = require("lodash");
class ScenarioHelper {
    constructor(system) {
        this.system = system;
        this.logger = this.system.logger.getLogger('ScenarioReader');
    }
    getPluginsIds(scenario) {
        let ids = [];
        scenario.nodes.forEach(function (node) {
            ids.push(node.pluginId);
        });
        return _.uniq(ids);
    }
    isAbleToStart(scenario) {
        let self = this;
        let ok = true;
        let pluginsIds = self.getPluginsIds(scenario);
        pluginsIds.forEach(function (id) {
            if (!self.system.runtime.plugins.get(id)) {
                ok = false;
            }
        });
        return ok;
    }
}
exports.ScenarioHelper = ScenarioHelper;
//# sourceMappingURL=scenario-helper.js.map
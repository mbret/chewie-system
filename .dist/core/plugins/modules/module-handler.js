'use strict';
var async = require('async');
class ModuleHandler {
    constructor(system) {
        this.logger = system.logger.getLogger('ModuleHandler');
        this.system = system;
    }
    initializeModules(done) {
        var modules = this.system.runtime.modules.values();
        var self = this;
        async.forEachOf(modules, function (module, id, cb) {
            self.logger.debug('Initialize module [%s]', module.id);
            var initialized = false;
            try {
                module.instance.initialize(function (err) {
                    initialized = true;
                    return cb(err);
                });
            }
            catch (err) {
                return cb(err);
            }
            setTimeout(function () {
                if (!initialized) {
                    self.logger.warn('The module [%s] seems to take abnormal long time to start!', module.id);
                }
            }, 1500);
        }, done);
    }
}
module.exports = ModuleHandler;
//# sourceMappingURL=module-handler.js.map
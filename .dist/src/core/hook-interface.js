"use strict";
const events_1 = require("events");
class Hook extends events_1.EventEmitter {
    constructor(system, config) {
        super();
        this.system = system;
        this.logger = this.getLogger();
        this.config = config;
    }
    getLogger() {
        return this.system.logger.getLogger('Hook');
    }
}
exports.Hook = Hook;
exports.hookMixin = {
    emit(e) {
        console.log("PAPA SHULTZ", e, super.emit);
        super.emit.apply(this, arguments);
    }
};
//# sourceMappingURL=hook-interface.js.map
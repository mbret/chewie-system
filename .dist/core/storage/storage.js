"use strict";
const database_1 = require("./database/database");
class Storage {
    constructor(system) {
        this.system = system;
        this.database = new database_1.default(system);
        this.logger = system.logger.getLogger('Storage');
    }
    initialize() {
        let self = this;
        return this.database.initialize()
            .then(function () {
            self.logger.verbose("Initialized");
            return Promise.resolve();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Storage;
//# sourceMappingURL=storage.js.map
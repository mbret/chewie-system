"use strict";
var database_1 = require("./database/database");
var Storage = (function () {
    function Storage(system) {
        this.system = system;
        this.database = new database_1.default(system);
        this.logger = system.logger.Logger.getLogger('Storage');
    }
    Storage.prototype.initialize = function () {
        var self = this;
        return this.database.initialize()
            .then(function () {
            self.logger.verbose("Initialized");
            return Promise.resolve();
        });
    };
    return Storage;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Storage;

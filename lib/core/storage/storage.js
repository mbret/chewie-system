"use strict";
var database_1 = require("./database/database");
var Storage = (function () {
    function Storage(system) {
        this.system = system;
        this.database = new database_1.default(system);
    }
    Storage.prototype.initialize = function () {
        this.database.initialize();
    };
    return Storage;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Storage;

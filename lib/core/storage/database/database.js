"use strict";
var Sequelize = require('sequelize');
var mkdirp = require('mkdirp');
var path = require("path");
var self = null;
var Database = (function () {
    function Database(system) {
        self = this;
        this.system = system;
        this.models = {};
        this.config = {
            modelsPath: "./models"
        };
    }
    Database.prototype.initialize = function () {
        var sequelize = new Sequelize('database', 'admin', null, this.system.config.storageDatabaseConnexion);
        var modelsPath = this.config.modelsPath;
        mkdirp.sync(path.dirname(this.system.config.storageDatabaseConnexion.storage));
        this.models.Profiles = require(modelsPath + '/profile').default(sequelize);
        return Promise
            .all([
            self.models.Profiles.sync({ force: this.system.config.storageDatabaseConnexion.dropOnStartup }),
        ])
            .then(function () {
            return Promise.resolve();
        });
    };
    return Database;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Database;

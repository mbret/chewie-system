"use strict";
let Sequelize = require('sequelize');
let mkdirp = require('mkdirp');
let path = require("path");
let self = null;
class Database {
    constructor(system) {
        self = this;
        this.system = system;
        this.models = {};
        this.config = {
            modelsPath: "./models"
        };
    }
    initialize() {
        let sequelize = new Sequelize('database', 'admin', null, this.system.config.storageDatabaseConnexion);
        let modelsPath = this.config.modelsPath;
        mkdirp.sync(path.dirname(this.system.config.storageDatabaseConnexion.storage));
        this.models.Profiles = require(modelsPath + '/profile').default(sequelize);
        return Promise
            .all([
            self.models.Profiles.sync({ force: this.system.config.storageDatabaseConnexion.dropOnStartup }),
        ])
            .then(function () {
            return Promise.resolve();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Database;
//# sourceMappingURL=database.js.map
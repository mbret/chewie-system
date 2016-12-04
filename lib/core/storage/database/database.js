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
        // init dir for storage first
        mkdirp.sync(path.dirname(this.system.config.storageDatabaseConnexion.storage));
        // Define models
        console.log(require(modelsPath + '/profile'));
        this.models.Profiles = require(modelsPath + '/profile').default(sequelize);
        // create tables
        return Promise
            .all([
            self.models.Profiles.sync({ force: this.system.config.storageDatabaseConnexion.dropOnStartup }),
        ])
            .then(function () {
            // server.logger.verbose("ORM initialized");
            // // Add the db as a storage for logs
            // // Every logs since this point will be stored in db
            // server.system.logger.Logger.addTransportForAllLoggers(new WinstonTransportSequelize({
            //     sequelize: server.orm.sequelize,
            //     model: server.orm.models.Logs,
            //     level: server.system.config.log.level
            // }));
            //
            // // By default there is always one user. The administrator
            // return server.orm.models.User.initAdmin();
        });
    };
    return Database;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Database;

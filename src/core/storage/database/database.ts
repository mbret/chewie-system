"use strict";
import {System} from "../../../system";
let Sequelize = require('sequelize');
let mkdirp = require('mkdirp');
let path = require("path");
let self = null;

export default class Database implements InitializeAbleInterface {
    system: System;
    models: any;
    config: any;

    constructor(system: System) {
        self = this;
        this.system = system;
        this.models = {};
        this.config = {
            modelsPath: "./models"
        };
    }

    initialize() {
        return Promise.resolve();

        // let sequelize = new Sequelize('database', 'admin', null, this.system.config.storageDatabaseConnexion);
        // let modelsPath = this.config.modelsPath;
        //
        // // init dir for storage first
        // mkdirp.sync(path.dirname(this.system.config.storageDatabaseConnexion.storage));
        //
        // // Define models
        // this.models.Profiles = require(modelsPath + '/profile').default(sequelize);
        //
        // // create tables
        // return Promise
        //     .all([
        //         self.models.Profiles.sync({force: this.system.config.storageDatabaseConnexion.dropOnStartup}),
        //     ])
        //     .then(function () {
        //         // server.logger.verbose("ORM initialized");
        //         // // Add the db as a storage for logs
        //         // // Every logs since this point will be stored in db
        //         // server.system.logger.addTransportForAllLoggers(new WinstonTransportSequelize({
        //         //     sequelize: server.orm.sequelize,
        //         //     model: server.orm.models.Logs,
        //         //     level: server.system.config.log.level
        //         // }));
        //         //
        //         // // By default there is always one user. The administrator
        //         // return server.orm.models.User.initAdmin();
        //         return Promise.resolve();
        //     });
    }
}
"use strict";
import Database from "./database/database";
import {Daemon} from "../../daemon";
import {SystemModuleInterface} from "../system-module-interface";

export default class Storage implements SystemModuleInterface, InitializeAbleInterface {
    system: Daemon;
    database: Database;
    logger: any;

    constructor(system: Daemon) {
        this.system = system;
        this.database = new Database(system);
        this.logger = system.logger.Logger.getLogger('Storage');
    }

    initialize() {
        let self = this;
        return this.database.initialize()
            .then(function() {
                self.logger.verbose("Initialized");

                return Promise.resolve();
            });
    }
}
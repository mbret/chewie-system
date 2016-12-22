"use strict";
import Database from "./database/database";
import {System} from "../../system";
import {SystemModuleInterface} from "../system-module-interface";

export default class Storage implements SystemModuleInterface, InitializeAbleInterface {
    system: System;
    database: Database;
    logger: any;

    constructor(system: System) {
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
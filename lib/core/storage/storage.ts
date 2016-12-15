"use strict";
import Database from "./database/database";
import {Daemon} from "../../daemon";

export default class Storage implements InitializeAbleInterface {
    database: Database;
    system: Daemon;

    constructor(system: Daemon) {
        this.system = system;
        this.database = new Database(system);
    }

    initialize() {
        return this.database.initialize();
    }
}
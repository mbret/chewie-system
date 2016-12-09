"use strict";
import Database from "./database/database";
import {Daemon} from "../../daemon";

export default class Storage {
    database: Database;
    system: Daemon;

    constructor(system: Daemon) {
        this.system = system;
        this.database = new Database(system);
    }

    initialize() {
        this.database.initialize();
    }
}
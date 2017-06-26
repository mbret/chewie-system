import * as loki from "lokijs";
import {System} from "../../system";
import path = require("path");
import { EventEmitter }  from "events";

/**
 * .chewie/.user.settings
 * .chewie/.system.data
 */
export default class PersistenceService extends EventEmitter {

    protected chewie: System;
    protected dbFileName: string;

    public db: any;
    public entries: any;

    constructor(chewie) {
        super();
        this.chewie = chewie;
        this.dbFileName = path.join(this.chewie.config.systemAppDataPath, '.system.data');
    }

    public initialize() {
        let self = this;
        // use LokiFsAdapter
        // console.log(`Load db ${this.dbFileName}`);
        this.db = new loki(this.dbFileName, {
            autoload: true,
            autoloadCallback : loadHandler,
            // autosave: true,
            // autosaveInterval: 1000, // 10 seconds
        });

        function loadHandler() {
            // if database did not exist it will be empty so I will intitialize here
            let entries = self.db.getCollection('entries');
            if (entries === null) {
                entries = self.db.addCollection('entries');
                entries.insert({
                    name: 'auth.token',
                    value: null
                });
                entries.insert({
                    name: 'auth.refreshToken',
                    value: null
                });
                // console.log(`new db ${self.dbFileName} has been initialized`);
            }
            // console.log(`Dd ${self.dbFileName} fully loaded`);
            self.db.saveDatabase();
            self.emit('db:ready');
        }

        return new Promise((resolve, reject) => {
            self.once('db:error', reject);
            self.once('db:ready', function() {
                this.entries = this.db.getCollection('entries');
                resolve();
            })
        });
    }
}
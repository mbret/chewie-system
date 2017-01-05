'use strict';

import * as path from "path";
import * as os from "os";

// module base path
let basePath = path.join(__dirname, '../..');
let localAppDataDir = os.platform() === 'win32' || os.platform() === 'win64' ? process.env.LOCALAPPDATA : os.homedir();

module.exports = {

    env: process.env.NODE_ENV || "development",

    log: {
        level: "silly"
    },

    storageDatabaseConnexion: {
        host: 'localhost',
        dialect: 'sqlite',
        // SQLite only
        storage: path.join(localAppDataDir, '.my-buddy', 'storage/database.sqlite'),
        dropOnStartup: false,
        logging: false,
        // Will activate validation for type ex Enum
        typeValidation: true
    },

    sharedDatabase: {
        connexion: {
            host: 'localhost',
            dialect: 'sqlite',

            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },

            // SQLite only
            storage: path.join(localAppDataDir, '.my-buddy', 'storage/shared-database.sqlite'),

            dropOnStartup: false,
            logging: false,

            // Will activate validation for type ex Enum
            typeValidation: true
        }
    },

    users: {
        rolesLabel: (new Map())
            .set('admin', 'Administrator')
            .set('user', 'User')
    },
    sharedApiUrl: "https://localhost:3002",

    // **************************************************
    //                                                  *
    //  Web server configuration                        *
    //                                                  *
    // **************************************************
    webServerPort: process.env.PORT || 3000,

    // ssl configuration. Same as for the shared api server
    webServerSSL: {
        activate: true,
        key: __dirname + "/server.key",
        cert: __dirname + "/server.crt",
    },

    // **************************************************
    //                                                  *
    //  These attributes are provided on system runtime *
    //                                                  *
    // **************************************************
    systemIP: null,

    resourcesDir: path.resolve(basePath, 'resources'),
    // coreHooksDir: path.resolve(basePath, "lib/hooks"),

    // Run a specific profile at startup. The value must match an user username.
    profileToLoadOnStartup: null,

    auth: {
        jwtSecret: 'zbla'
    },

    pluginsLocalRepositoryDir: path.join(localAppDataDir, '.my-buddy/data/plugins-repository'),
    forcePluginsSynchronizeAtStartup: false,

    system: {
        tmpDir: path.join(os.tmpdir(), '.my-buddy'),
        dataDir: path.join(localAppDataDir, '.my-buddy/data'),
        synchronizedPluginsDir: "plugins-synchronized", // under data dir
        pluginsTmpDir: path.join(os.tmpdir(), '.my-buddy/plugins-tmp-data'),
        pluginsDataDir: path.join(localAppDataDir, '.my-buddy/data/plugins-data'),

        // By default there are no speaker adapter.
        // The system may run without adapter it will just no output sound.
        speakerAdapter: null
    },

    hooks: {
        "client-web-server": {
            proxyServerPort: 3001
        },
        "shared-server-api": {
            port: 3002,
            // ssl configuration. By default it's not activated
            // in case of activation a default certificate and key is provided if needed
            // but should never be used in production.
            ssl: {
                activate: true,
                key: __dirname + "/server.key",
                cert: __dirname + "/server.crt",
            },
        }
    }
};
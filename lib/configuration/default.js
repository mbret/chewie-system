'use strict';
var path = require('path');
var os = require('os');

// module base path
var basePath = path.join(__dirname, '../..');
var localAppDataDir = os.platform() === 'win32' || os.platform() === 'win64' ? process.env.LOCALAPPDATA : os.homedir();

/**
 * This is the user config.
 *
 */
module.exports = {

    env: process.env.NODE_ENV || "development",

    log: {
        level: 'debug'
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

    // **************************************************
    //                                                  *
    //  Shared Api server configuration                 *
    //                                                  *
    // **************************************************
    sharedApiPort: 3001,

    // if set the system will use it instead of localhost & port provided.
    // when set to null the value is set during runtime and should looks like "http://localhost:yourPort"
    sharedApiUrl: null,

    // ssl configuration. By default it's not activated
    // in case of activation a default certificate and key is provided if needed
    // but should never be used in production.
    sharedApiSSL: {
        activate: true,
        key: __dirname + "/server.key",
        cert: __dirname + "/server.crt",
    },

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
    coreHooksDir: path.resolve(basePath, "lib/hooks"),

    // Run a specific profile at startup. The value must match an user username.
    profileToLoadOnStartup: null,

    auth: {
        jwtSecret: 'zbla'
    },

    pluginsLocalRepositoryDir: null,

    system: {
        tmpDir: path.join(os.tmpdir(), '.my-buddy'),
        dataDir: path.join(localAppDataDir, '.my-buddy', 'data'),

        // runtime set
        // Either forced in config or set during runtime using tmpDir, dataDir, etc
        synchronizedPluginsDir: undefined,
        pluginsTmpDir: undefined,
        pluginsDataDir: undefined,

        // By default there are no speaker adapter.
        // The system may run without adapter it will just no output sound.
        speakerAdapter: null
    }
};
'use strict';
const path = require("path");
const os = require("os");
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
        storage: path.join(localAppDataDir, '.my-buddy', 'storage/database.sqlite'),
        dropOnStartup: false,
        logging: false,
        typeValidation: true
    },
    users: {
        rolesLabel: (new Map())
            .set('admin', 'Administrator')
            .set('user', 'User')
    },
    sharedApiUrl: "https://localhost:3002",
    webServerPort: process.env.PORT || 3000,
    webServerSSL: {
        activate: true,
        key: basePath + "/resources/.ssh/server.key",
        cert: basePath + "/resources/.ssh/server.crt",
    },
    systemIP: null,
    resourcesDir: path.resolve(basePath, 'resources'),
    profileToLoadOnStartup: null,
    auth: {
        jwtSecret: 'zbla'
    },
    pluginsLocalRepositoryDir: path.join(localAppDataDir, '.my-buddy/data/plugins-repository'),
    forcePluginsSynchronizeAtStartup: false,
    system: {
        tmpDir: path.join(os.tmpdir(), '.my-buddy'),
        dataDir: path.join(localAppDataDir, '.my-buddy/data'),
        synchronizedPluginsDir: "plugins-synchronized",
        pluginsTmpDir: path.join(os.tmpdir(), '.my-buddy/plugins-tmp-data'),
        pluginsDataDir: path.join(localAppDataDir, '.my-buddy/data/plugins-data'),
        speakerAdapter: null
    },
    hooks: {
        "client-web-server": {
            proxyServerPort: 3001
        },
        "shared-server-api": {
            ssl: {
                key: basePath + "/resources/.ssh/server.key",
                cert: basePath + "/resources/.ssh/server.crt",
            },
            sharedDatabase: {
                connexion: {
                    storage: path.join(localAppDataDir, '.my-buddy', 'storage/shared-database.sqlite'),
                }
            }
        }
    }
};
//# sourceMappingURL=default.js.map
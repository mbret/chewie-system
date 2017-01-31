"use strict";
module.exports = {
    port: 3002,
    ssl: {
        activate: true,
        key: __dirname + "/../../../resources/.ssh/server.key",
        cert: __dirname + "/../../../resources/.ssh/server.crt"
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
            dropOnStartup: false,
            logging: false,
            typeValidation: true,
        },
        migrationDir: __dirname + "/db-migrate",
        migrationLogs: false
    },
    storageFileName: "shared-database.db",
};
//# sourceMappingURL=hook-config.js.map
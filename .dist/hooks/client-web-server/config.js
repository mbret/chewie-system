"use strict";
module.exports = {
    port: 3002,
    ssl: {
        activate: true
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
            typeValidation: true
        },
        migrationDir: __dirname + "/../db-migrate",
        migrationLogs: false
    }
};
//# sourceMappingURL=config.js.map
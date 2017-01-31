module.exports = {
    port: 3002,
    // ssl configuration. By default it's not activated
    // in case of activation a default certificate and key is provided if needed
    // but should never be used in production.
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
            // Will activate validation for type ex Enum
            typeValidation: true,
        },
        migrationDir: __dirname + "/db-migrate",
        migrationLogs: false
    },
    // SQLite only. Located inside app data /storage directory.
    storageFileName: "shared-database.sqlite",
};
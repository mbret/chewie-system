var os = require('os');
var path = require('path');

var localAppDataDir = os.platform() === 'win32' || os.platform() === 'win64' ? process.env.LOCALAPPDATA : os.homedir();

module.exports.database = {
    connexion: {
        host: 'localhost',
        dialect: 'sqlite',

        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },

        // SQLite only
        storage: path.join(localAppDataDir, '.my-buddy', 'storage/database.sqlite'),

        dropOnStartup: false
    }
};
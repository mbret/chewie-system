// var nedbAdapter = require('waterline-nedb');
var os = require('os');
var path = require('path');

// var localAppDataDir = os.platform() === 'win32' || os.platform() === 'win64' ? process.env.LOCALAPPDATA : os.homedir();

module.exports.waterline = {
    adapters: {
        nedb: require('waterline-nedb'),
        disk: require('sails-disk'),
        sqlite: require('waterline-sqlite3'),
    },

    connections: {
        default: {
            adapter: 'sqlite',
            // dbPath: path.join(localAppDataDir, '.my-buddy', 'storage/waterline'),
            // Optional options:
            // inMemoryOnly: false // Enable in memory (no file access) mode.
            // filePath : path.join(localAppDataDir, '.my-buddy', 'storage/waterline')
        }
    }
};
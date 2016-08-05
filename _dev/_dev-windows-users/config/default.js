'use strict';

var path = require('path');

module.exports = {
    database: {
        connexion: {
            storage: path.join(__dirname, '..', '.my-buddy/storage/database.sqlite'),
            dropOnStartup: true
        }
    }
};
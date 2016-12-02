'use strict';

var path = require('path');

module.exports = {

    profileToLoadOnStartup: "admin",
    
    system: {
        tmpDir:         path.join(__dirname, '../.my-buddy/tmp'),
        dataDir:        path.join(__dirname, '../.my-buddy/data')
    },

    pluginsLocalRepositoryDir: path.join(__dirname, '../../plugins'),

    database: {
        connexion: {
            storage: path.join(__dirname, '../.my-buddy/storage/db.sqlite'),
            dropOnStartup: true
        }
    },

    webServerSSL: {
        activate: true
    },

    sharedApiSSL: {
        activate: true
    }
};
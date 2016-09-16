'use strict';

var path = require('path');

module.exports = {

    profileToLoadOnStartup: "admin",
    
    system: {
        tmpDir:         path.join(process.env.APP_ROOT_PATH, '.my-buddy/tmp'),
        dataDir:        path.join(process.env.APP_ROOT_PATH, '.my-buddy/data'),
    },

    plugins: {
        localRepositories: [process.env.APP_ROOT_PATH + '/../plugins']
    },

    database: {
        connexion: {
            storage: path.join(process.env.APP_ROOT_PATH, '.my-buddy/storage/db.sqlite'),
            dropOnStartup: true
        }
    }
};
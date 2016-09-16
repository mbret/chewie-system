'use strict';

var path = require('path');

module.exports = {

    system: {

        // speakerAdapter: {
        //    module: require('my-buddy-lib').speakerAdapter,
           // module: require("D:/Workspace/my-buddy/my-buddy-lib").speakerAdapter,
        //    options: {
        //        // use mpg123 by default
        //        mpg123BinaryPath: "C:/Program Files/mpg123"
        //    }
        // }
    },

    database: {
        connexion: {
            storage: path.join(process.env.APP_ROOT_PATH, '.my-buddy/storage/db.sqlite'),
            dropOnStartup: true
        }
    }
};
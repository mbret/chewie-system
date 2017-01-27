'use strict';

module.exports = {

    profileToLoadOnStartup: "admin",

    system: {
        speakerAdapter: {
            // module: require('my-buddy-lib').speakerAdapter,
            module: require("my-buddy-lib").speakerAdapter,
            options: {
                // use mpg123 by default
                mpg123BinaryPath: ""
            }
        }
    },
};
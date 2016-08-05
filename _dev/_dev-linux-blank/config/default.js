'use strict';

var path = require('path');

module.exports = {

    system: {
        speakerAdapter: {
            // module: require('my-buddy-lib').speakerAdapter,
            module: require("my-buddy-lib").speakerAdapter,
            options: {
                // use mpg123 by default
                mpg123BinaryPath: ""
            }
        }
    }
};
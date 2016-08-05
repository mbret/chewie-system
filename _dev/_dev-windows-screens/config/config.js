
'use strict';

var path = require('path');

module.exports = {
    profileToLoadOnStartup: "admin",
    plugins: {
        localRepositories: [process.env.APP_ROOT_PATH + '/plugins']
    },
};
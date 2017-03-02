'use strict';

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

const chewie = require("chewie-system");

// Start the system
chewie.start({
    settings: {
        // bootstrap: function(chewie, done) {
        //     chewie.repositoriesHelper.reinstallPluginFromDisk(__dirname + "/../plugins/chewie-plugin-request")
        //         .then(() => done())
        //         .catch(done);
        // },
        "alwaysSynchronizePlugins": true,
        "system": {
            "tmpDir": "./.chewie/.tmp",
            "appDataPath": "./.chewie"
        },
        "pluginsLocalRepositoryDir": "./../plugins",
        "hooks": {
            "client-web-server": true,
            // "scenarios": true,
            // "plugins": false,
            // "placeholder": { modulePath: __dirname + "/../hooks/placeholder" },
            // "chewie-hook-seed": { modulePath: "C:/Users/mbret/Workspace/chewie-hook-seed" },
            // "chewie-hook-thirdparty-auth-provider": {
            //     // required because of symlink
            //     modulePath: __dirname + "/node_modules/chewie-hook-thirdparty-auth-provider"
            // },
            // "shared-server-api": {
            //     "config": {
            //         "sharedDatabase": {
            //             "connexion": {
            //                 "dropOnStartup": false
            //             },
            //             "migrationLogs": true
            //         }
            //     }
            // }
        }
    }
});
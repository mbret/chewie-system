'use strict';

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

const chewie = require("chewie-system");

// Start the system
chewie.start({
    settings: {
        bootstrap: {
            bootstrap: function(system, done) {
                return done();
            }
        },
        "profileToLoadOnStartup": "admin",
        "system": {
            "tmpDir": "./.chewie/.tmp",
            "appDataPath": "./.chewie"
        },
        "pluginsLocalRepositoryDir": "./../plugins",
        "hooks": {
            "placeholder": { modulePath: __dirname + "/../hooks/placeholder" },
            "chewie-hook-thirdparty-auth-provider": {
                // required because of symlink
                modulePath: __dirname + "/node_modules/chewie-hook-thirdparty-auth-provider"
            },
            "shared-server-api": {
                "config": {
                    "sharedDatabase": {
                        "connexion": {
                            "storage": "./.my-buddy/storage/db.sqlite",
                            "dropOnStartup": false
                        },
                        "migrationLogs": true
                    }
                }
            }
        },
        "forcePluginsSynchronizeAtStartup": true
    }
});
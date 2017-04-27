"use strict";

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

const chewie = require("chewie-system");

// Start the system
chewie.start({
    settings: {
        bootstrap: function(chewie, done) {
            // chewie.repositoriesHelper.reinstallPluginFromDisk(__dirname + "/../plugins/facebook-logger")
            //     .then(() => done())
            //     .catch(done);

            chewie.on("ready", function() {
                chewie.email.send({
                    from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
                    to: 'xmax54@gmail.com', // list of receivers
                    subject: 'Hello ✔', // Subject line
                    text: 'Hello world ?', // plain text body
                    html: '<b>Hello world ?</b>' // html body
                }, function(err, res) {
                    console.log("err", err, "res", res);
                });
            });

            done();
        },
        "alwaysSynchronizePlugins": true,
        "systemTmpDir": "./.chewie/.tmp",
        "systemAppDataPath": "./.chewie",
        "pluginsLocalRepositoryDir": "./../plugins",
        "hooks": {
            // "client-web-server": false,
            // "shared-server-api": false,
            // "scenarios": false,
            "plugins": false,
            // "placeholder": { modulePath: __dirname + "/../hooks/placeholder" },
            // "chewie-hook-gmail-adapter": { modulePath: __dirname + "/../hooks/chewie-hook-gmail-adapter" },
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
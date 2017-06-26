module.exports = function(chewie, done) {
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
};

// "hooks": {
//     "client-web-server": false,
//         // "shared-server-api": false,
//         "scenarios": false,
//         "plugins": false,
//     // "placeholder": { modulePath: __dirname + "/../hooks/placeholder" },
//     // "chewie-hook-gmail-adapter": { modulePath: __dirname + "/../hooks/chewie-hook-gmail-adapter" },
//     // "chewie-hook-seed": { modulePath: "C:/Users/mbret/Workspace/chewie-hook-seed" },
//     // "chewie-hook-thirdparty-auth-provider": {
//     //     // required because of symlink
//     //     modulePath: __dirname + "/node_modules/chewie-hook-thirdparty-auth-provider"
//     // },
//     // "shared-server-api": {
//     //     "config": {
//     //         "sharedDatabase": {
//     //             "connexion": {
//     //                 "dropOnStartup": false
//     //             },
//     //             "migrationLogs": true
//     //         }
//     //     }
//     // }
// },
// "hooks": {
//   "client-web-server": false,
//     "scenarios": false,
//     "plugins": false
// }
// "alwaysSynchronizePlugins": true,
//   "pluginsLocalRepositoryDir": "./../plugins",
//   "sharedServerApi": {
//   "auth": {
//     "jwtSecret": "foo",
//       "secretPassword": "foo"
//   }
// }
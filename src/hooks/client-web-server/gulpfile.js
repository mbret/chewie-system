"use strict";

/**
 * https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub
 */

let argv = require('yargs').argv;
let gulp = require('gulp');
const requireAll = require("require-all");
let basePath = __dirname + "/../../..";
let path = require("path");
// let buildPath = __dirname + "/.build";
// let copyOfNodeModulesDestPath = "./public/node_modules";
let distAppPath = path.join(basePath, "/.dist/hooks/client-web-server");
let srcAppPath = path.join(basePath, "src/hooks/client-web-server");

// --from-source for when working from sources
// if (argv.fromSource) {
let buildPath = path.join(distAppPath, ".build");
let copyOfNodeModulesDestPath = path.join(distAppPath, copyOfNodeModulesDestPath);
// }

let config = {
    fromSource: argv.fromSource,
    publicPath: __dirname + "/public",
    buildPath: buildPath,
    basePath: basePath,
    srcAppPath: srcAppPath,
    nodeModulesPath: path.join(basePath, "node_modules"),
    copyOfNodeModulesDestPath: copyOfNodeModulesDestPath,
    distAppPath: distAppPath,
    env: process.env.NODE_ENV,
    nodeModulesToCopy: [
        "socket.io-client",
        "lodash",
        "jquery",
        "angular",
        "angular-ui-router",
        "angular-messages",
        "angular-ui-bootstrap",
        "angular-socket-io",
        "jquery-slimscroll",
        "angular-logger",
        "sprintf-js",
    ],
    vendorsNodeModulesToInject: [
        "./node_modules/sprintf-js/dist/sprintf.min.js",
        "./node_modules/jquery/dist/jquery.js",
        "./node_modules/jquery-slimscroll/dist/jquery.slimscroll.js",
        "./node_modules/lodash/lodash.js",
        "./node_modules/angular/angular.js",
        "./node_modules/angular-ui-router/release/angular-ui-router.js",
        // require momentjs & sprintfjs
        "./node_modules/angular-logger/dist/angular-logger.min.js",
        "./node_modules/angular-messages/angular-messages.js",
        "./node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js",
        "./node_modules/socket.io-client/dist/socket.io.slim.js",
        "./node_modules/angular-socket-io/socket.min.js",
    ],
    vendorsToInject: [
        "./public/vendors/iCheck/icheck.js",
        "./public/vendors/masonry/dist/masonry.pkgd.min.js",
        "./public/vendors/bootstrap-daterangepicker/daterangepicker.js",
        "./public/vendors/angular-daterangepicker/js/angular-daterangepicker.min.js",
        "./public/vendors/angular-socket-io/*.min.js",
        "./public/vendors/angular-toastr/dist/*.min.js",
        "./public/vendors/angular-translate/*.min.js",
        "./public/vendors/angular-oauth2/dist/*.min.js",
        "./public/vendors/angular-cookies/*.min.js",
        "./public/vendors/query-string/*.js",
        "./public/vendors/angular-logger/dist/*.min.js",
        "./public/vendors/angular-ui-tree/dist/angular-ui-tree.js",
        "./public/vendors/angular-masonry/angular-masonry.js",
        "./public/vendors/ngstorage/ngStorage.js"
    ],
    taskLoadConfig: {
        // simples
        // copy public assets from /src/../public to /.dist/../.build
        "copy-public": [],
        "build-less": [],
        "watch-less": [],
        "watch-public": [],
        "inject-js": ["copy-public", "copy-node-modules"],
        "copy-node-modules": [],
        // primaries
        "build": ["build-less", "inject-js"],
        "watch": ["watch-less", "watch-public"],
        "clean": []
    }
};

// load tasks
requireAll({
    dirname: __dirname + "/tasks",
    recursive: true,
    resolve: function (task) {
        let taskToLoad = task(gulp, config);
        if (config.taskLoadConfig[taskToLoad.name] !== undefined) {
            return gulp.task(taskToLoad.name, config.taskLoadConfig[taskToLoad.name], taskToLoad.fn);
        }
    },
});
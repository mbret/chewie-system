"use strict";

/**
 * https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub
 */

let argv = require('yargs').argv;
let gulp = require('gulp');
const requireAll = require("require-all");
let basePath = __dirname + "/../../..";
let path = require("path");
let buildPath = __dirname + "/.build";

// --from-source for when working from sources
if (argv.fromSource) {
    buildPath = path.join(basePath, "/.dist/hooks/client-web-server/.build");
}

let config = {
    publicPath: __dirname + "/public",
    buildPath: buildPath,
    nodeModulesPath: path.join(basePath, "node_modules"),
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
    vendorsToInject: [
        "./public/node_modules/sprintf-js/dist/sprintf.min.js",
        "./public/node_modules/jquery/dist/jquery.js",
        "./public/node_modules/jquery-slimscroll/dist/jquery.slimscroll.js",
        "./public/node_modules/lodash/lodash.js",
        "./public/node_modules/angular/angular.js",
        "./public/node_modules/angular-ui-router/release/angular-ui-router.js",
        // require momentjs & sprintfjs
        "./public/node_modules/angular-logger/dist/angular-logger.min.js",
        "./public/node_modules/angular-messages/angular-messages.js",
        "./public/node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js",
        "./public/node_modules/socket.io-client/dist/socket.io.slim.js",
        "./public/node_modules/angular-socket-io/socket.min.js",
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
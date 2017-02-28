"use strict";

/**
 * https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub
 */

let argv = require('yargs').argv;
let gulp = require('gulp');
const requireAll = require("require-all");
let basePath = __dirname + "/../../..";
let path = require("path");
const clean = require('gulp-clean');
const less = require('gulp-less');
const inject = require('gulp-inject');
const series = require('stream-series');
const changed = require('gulp-changed');
// let buildPath = __dirname + "/.build";
let copyOfNodeModulesDestPath = "./public/node_modules";
let distAppPath = path.join(basePath, "/.dist/hooks/client-web-server");
let srcAppPath = path.join(basePath, "src/hooks/client-web-server");

// --from-source for when working from sources
// if (argv.fromSource) {
let buildPath = path.join(distAppPath, ".build");
copyOfNodeModulesDestPath = path.join(distAppPath, copyOfNodeModulesDestPath);
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
    vendorsToInject: [
        "vendors/sprintf/dist/sprintf.min.js",
        "vendors/jquery/dist/jquery.js",
        "vendors/jquery-slimscroll/jquery.slimscroll.min.js",
        "vendors/lodash/lodash.js",
        "vendors/angular/angular.js",
        "vendors/angular-ui-router/release/angular-ui-router.js",
        "vendors/angular-logger/dist/angular-logger.min.js",
        "vendors/angular-messages/angular-messages.js",
        "vendors/angular-bootstrap/ui-bootstrap-tpls.js",
        "vendors/socket.io-client/dist/socket.io.slim.js",
        "vendors/angular-socket-io/socket.min.js",
        "vendors/iCheck/icheck.js",
        "vendors/masonry/dist/masonry.pkgd.min.js",
        "vendors/bootstrap-daterangepicker/daterangepicker.js",
        "vendors/angular-daterangepicker/js/angular-daterangepicker.min.js",
        "vendors/angular-socket-io/*.min.js",
        "vendors/angular-toastr/dist/*.min.js",
        "vendors/angular-translate/*.min.js",
        "vendors/angular-oauth2/dist/*.min.js",
        "vendors/angular-cookies/*.min.js",
        "vendors/query-string/*.js",
        "vendors/angular-logger/dist/*.min.js",
        "vendors/angular-ui-tree/dist/angular-ui-tree.js",
        "vendors/angular-masonry/angular-masonry.js",
        "vendors/ngstorage/ngStorage.js"
    ]
};

// gulp.task("copy-node-modules", function() {
//     // @todo use options.cwd for src (cwd: config.distAppPath)
//     return gulp
//         .src(config.nodeModulesToCopy.map(function(name) {
//             return path.join(config.nodeModulesPath, name + "/**/*");
//         }), { base: config.nodeModulesPath })
//         .pipe(gulp.dest(path.join(config.buildPath, "node_modules")));
// });
gulp.task("symlink-vendors", function() {
    // return gulp
    //     .src(["./public/vendors"], {
    //         cwd: config.srcAppPath
    //     })
    //     .pipe(gulp.symlink(config.buildPath));
});

gulp.task("copy-public", function() {
    return gulp
        .src([
            "./public/**/**",
            "!./public/{css,css/**}",
            "!./public/vendors/**",
            ], {
                cwd: config.srcAppPath
            }
        )
        .pipe(changed(config.buildPath))
        .pipe(gulp.dest(config.buildPath));
});
gulp.task("inject-js", gulp.series("symlink-vendors", gulp.parallel("copy-public"/*, "copy-node-modules"*/), function() {
    let target = gulp.src("./public/index.html");

    // It's not necessary to read the files (will speed up things), we're only after their paths:
    let appStream = gulp.src([
        'app/**/*.module.js',
        'app/**/module.js',
        'app/**/*.js',

        // ignore screens file for now
        '!app/screens/**/*.js'
    ], {
        read: false,
        cwd: config.distAppPath + "/.build"
    });
    let vendorsStream = gulp.src(config.vendorsToInject, {
        read: false,
        cwd: config.distAppPath + "/.build"
    });
    // let vendorsNodeModulesStream = gulp.src(config.vendorsNodeModulesToInject, {
    //     read: false,
    //     cwd: config.basePath
    // });

    return target
        .pipe(inject(series(/*vendorsNodeModulesStream, */vendorsStream, appStream), {
            ignorePath: "/public",
        }))
        .pipe(gulp.dest(config.buildPath));
}));
gulp.task("watch-less", function() {
    return gulp.watch([
        "public/css/**/*.less"
    ], gulp.series("build-less"));
});
gulp.task("watch-public", function() {
    return gulp.watch([
        "./public/**/**",
        "!./public/css"
    ], gulp.parallel("inject-js"/*, "copy-node-modules"*/));
});
gulp.task("build-less", function() {
    return gulp.src("./public/css/style.less")
        .pipe(less())
        .pipe(gulp.dest(path.join(config.buildPath, "/css")));
});

gulp.task("build", gulp.parallel("build-less", "inject-js"));
gulp.task("watch", gulp.parallel("watch-less", "watch-public"));
gulp.task("clean", function() {
    return gulp.src(config.buildPath, {read: false}).pipe(clean());
});
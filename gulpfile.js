// grab our gulp packages
let gulp  = require('gulp');
let gutil = require('gulp-util');
const changed = require('gulp-changed');
let vfs = require('vinyl-fs');
const clean = require('gulp-clean');
const less = require('gulp-less');
let path = require("path");
const inject = require('gulp-inject');
const series = require('stream-series');
let argv = require('yargs').argv;

let basePath = __dirname;
let copyOfNodeModulesDestPath = "./public/node_modules";
let distAppPath = path.join(basePath, "/.dist/hooks/client-web-server");
let srcAppPath = path.join(basePath, "src/hooks/client-web-server");

let buildPath = path.join(distAppPath, ".build");
copyOfNodeModulesDestPath = path.join(distAppPath, copyOfNodeModulesDestPath);

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
    srcJsFilesGlob: [
        // copy all json files to dist (hooks installation, etc)
        "./src/**/*",
        "!./src/**/*.ts",
        "!./src/**/README.md",
        "!./src/**/.gitkeep",
        "!./src/**/.gitignore",
        "!./src/**/package.json",
        "./src/hooks/**/package.json",
        "!./src/**/*.ts",
        // ignore public from client-web-server hook to avoid large data
        "!./src/hooks/client-web-server/public/**/*"
    ],
    vendorsToInject: [
        "vendors/sprintf-js/dist/sprintf.min.js",
        "vendors/jquery/dist/jquery.js",
        "vendors/jquery-slimscroll/jquery.slimscroll.min.js",
        // "vendors/angular/angular.js",
        // "vendors/angular-ui-router/release/angular-ui-router.js",
        // "vendors/angular-logger/dist/angular-logger.min.js",
        // "vendors/angular-messages/angular-messages.js",
        // "vendors/angular-bootstrap/ui-bootstrap-tpls.js",
        // "vendors/socket.io-client/dist/socket.io.slim.js",
        // "vendors/angular-socket-io/socket.min.js",
        // "vendors/iCheck/icheck.js",
        // "vendors/masonry/dist/masonry.pkgd.min.js",
        // "vendors/bootstrap-daterangepicker/daterangepicker.js",
        // "vendors/angular-daterangepicker/js/angular-daterangepicker.min.js",
        // "vendors/angular-socket-io/*.min.js",
        // "vendors/angular-toastr/dist/*.min.js",
        // "vendors/angular-translate/*.min.js",
        // "vendors/angular-oauth2/dist/*.min.js",
        // "vendors/angular-cookies/*.min.js",
        // "vendors/query-string/*.js",
        // "vendors/angular-logger/dist/*.min.js",
        // "vendors/angular-ui-tree/dist/angular-ui-tree.js",
        // "vendors/angular-masonry/angular-masonry.js",
        // "vendors/ngstorage/ngStorage.js"
    ]
};


// -------------------------------------------
//
//     Tasks relative to client-web-server
//
// -------------------------------------------

gulp.task("client-web-server:copy-vendors-npm", function() {
    return gulp.src([
        "node_modules/jquery/dist/jquery.js",
        "node_modules/sprintf-js/dist/sprintf.min.js",
        "node_modules/jquery-slimscroll/jquery.slimscroll.min.js",
    ], {base: "node_modules"})
        .pipe(gulp.dest(config.buildPath + "/vendors"))
});

gulp.task("client-web-server:symlinks", gulp.parallel("client-web-server:copy-vendors-npm", function() {
    return gulp.src([
        "public/resources",
    ], {
        cwd: config.srcAppPath
    })
        .pipe(gulp.symlink(config.buildPath))
}));

gulp.task("client-web-server:copy-public", function() {
    return gulp
        .src([
                "public/**/**",
                "!public/{css,css/**}",
                "!public/resources/**",
                "!public/vendors/**",
            ], {
                cwd: config.srcAppPath
            }
        )
        .pipe(changed(config.buildPath))
        .pipe(gulp.dest(config.buildPath));
});

gulp.task("client-web-server:inject-js", gulp.series(gulp.parallel("client-web-server:copy-public"), function() {
    let target = gulp.src(config.srcAppPath + "/public/index.html");

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

    return target
        .pipe(inject(series(vendorsStream, appStream), {
            ignorePath: "/public",
        }))
        .pipe(gulp.dest(config.buildPath));
}));

gulp.task("client-web-server:watch-less", function() {
    return gulp.watch([
        config.srcAppPath + "public/css/**/*.less"
    ], gulp.series("client-web-server:build-less"));
});

gulp.task("client-web-server:watch-public", function() {
    return gulp.watch([
        config.srcAppPath + "/public/**/**",
        "!" + config.srcAppPath + "/public/css"
    ], gulp.parallel("client-web-server:inject-js"));
});

gulp.task("client-web-server:build-less", function() {
    return gulp.src(config.srcAppPath + "/public/css/style.less")
        .pipe(less())
        .pipe(gulp.dest(path.join(config.buildPath, "/css")));
});

gulp.task("client-web-server:build", gulp.series("client-web-server:symlinks", gulp.parallel("client-web-server:copy-vendors-npm", "client-web-server:build-less", "client-web-server:inject-js")));
gulp.task("client-web-server:watch", gulp.parallel("client-web-server:watch-less", "client-web-server:watch-public"));

// -------------------------------------------
//
//     Globals Tasks
//
// -------------------------------------------

gulp.task("copy", function() {
    return gulp
        .src(config.srcJsFilesGlob, {base: "./src"})
        .pipe(changed("./.dist"))
        .pipe(gulp.dest("./.dist"));
});

// must be run as admin
gulp.task("generate-plugins-symlink", function() {
    return vfs.src("../chewie-plugin-date-time", {followSymlinks: false})
        .pipe(vfs.symlink(".dev/plugins"));
});

// must be run as admin
gulp.task("generate-dev-app-symlink", function() {
    return vfs.src("../chewie-app", {followSymlinks: false})
        .pipe(vfs.symlink(".dev"));
});

gulp.task("clean", function() {
    return gulp.src(config.buildPath, {read: false}).pipe(clean());
});

// create a default task and just log a message
gulp.task('build', gulp.parallel("copy", "client-web-server:build"));

gulp.task("watch", gulp.parallel("client-web-server:watch", function() {
    let tasks = ["copy"];
    let watcher = gulp
        .watch(config.srcJsFilesGlob, gulp.series.call(null, tasks));
    watcher.on("all", (event, filepath) => gutil.log(gutil.colors.yellow('Event "%s" on file "%s", running tasks [%s]'), event, filepath, tasks));
}));
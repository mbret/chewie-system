'use strict';

/**
 * https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub
 */

let gulp = require('gulp');
let inject = require('gulp-inject');
let angularFilesort = require('gulp-angular-filesort');
let series = require('stream-series');
let order = require("gulp-order");
let viewToInject = './www/layout.ejs';
let dev_mode = process.env.NODE_ENV !== "production";
let less = require('gulp-less');
let path = require('path');
let watch = require('gulp-watch');
let buildPath = ".build";

/**
 *
 */
gulp.task("copy-public", function() {
    gulp
        .src([
            "./public/**/**",
            "!./public/{css,css/**}"
        ])
        .pipe(gulp.dest(buildPath))
});

/**
 * Compile the less files
 */
gulp.task('build-less', function () {
    return gulp.src("./public/css/style.less")
        .pipe(less())
        .pipe(gulp.dest(path.join(buildPath, "/css")));
});

/**
 * Watch for any changes inside less files and run less task.
 */
gulp.task("watch-less", function() {
    return gulp.watch([
        "public/css/**/*.less"
    ], ["build-less"]);
});

gulp.task("watch-public", function() {
    return gulp.watch([
        "./public/**/**",
        "!./public/css"
        ], ["copy-public"]);
});

/**
 * Inject the js files from several stream into index.ejs
 */
gulp.task('inject_js', ["copy-public", "build-less"], function(){
    var target = gulp.src(viewToInject);

    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var appStream = gulp.src([
        './public/app/**/*.module.js',
        './public/app/**/module.js',
        './public/app/**/*.js',

        // ignore screens file for now
        '!./public/app/screens/**/*.js'
    ], {read: false});

    var vendorStream = gulp
        .src([
            "./public/vendors/masonry/dist/masonry.pkgd.min.js",
            './public/vendors/bootstrap-daterangepicker/daterangepicker.js',
            './public/vendors/angular-daterangepicker/js/angular-daterangepicker.min.js',
            './public/vendors/angular-socket-io/*.min.js',
            './public/vendors/angular-toastr/dist/*.min.js',
            './public/vendors/angular-translate/*.min.js',
            './public/vendors/angular-oauth2/dist/*.min.js',
            './public/vendors/angular-cookies/*.min.js',
            './public/vendors/query-string/*.js',
            './public/vendors/angular-logger/dist/*.min.js',
            "./public/vendors/angular-ui-tree/dist/angular-ui-tree.js",
            "./public/vendors/angular-masonry/angular-masonry.js"
        ], {read: false});

    return target
        .pipe(inject(series(vendorStream, appStream), {
            ignorePath: '/public/',
        }))
        .pipe(gulp.dest('./www'));
});

gulp.task('default', ["inject_js"], function(){
    return console.log('Gulp is running!');
});

gulp.task("watch", ["watch-less", "watch-public"], function() {

});

gulp.task("build", ["inject_js"]);
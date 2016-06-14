'use strict';

/**
 * https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub
 */

var gulp = require('gulp');
var inject = require('gulp-inject');
var angularFilesort = require('gulp-angular-filesort');
var series = require('stream-series');
var order = require("gulp-order");
var viewToInject = './www/layout.ejs';

/**
 * Copy content of bower directory to /vendors
 */
gulp.task('gulp_vendor', function(){
    gulp.src('./bower_components/**/**')
        .pipe(gulp.dest('./public/vendors'));
});

/**
 * Inject the js files from several stream into index.ejs
 */
gulp.task('inject_js', ['gulp_vendor'], function(){
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
            './public/vendors/bootstrap-daterangepicker/daterangepicker.js',
            './public/vendors/angular-daterangepicker/js/angular-daterangepicker.min.js',
            './public/vendors/angular-socket-io/*.min.js',
            './public/vendors/angular-toastr/dist/*.min.js',
            './public/vendors/angular-translate/*.min.js',
            './public/vendors/angular-oauth2/dist/*.min.js',
            './public/vendors/angular-cookies/*.min.js',
            './public/vendors/query-string/*.js',
            './public/vendors/angular-logger/dist/*.min.js',
        ], {read: false});

    return target
        .pipe(inject(series(vendorStream, appStream), {
            ignorePath: '/public/',
        }))
        .pipe(gulp.dest('./www'));
});

gulp.task('run', ['inject_js'], function(){
    return;
});